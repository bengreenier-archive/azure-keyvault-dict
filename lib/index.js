'use strict';

const keyvault = require('azure-keyvault');
const deasync = require('deasync');

/**
 * A KVDict represents keyvault data as a dictionary
 * 
 * note: this requires es6 proxies, which means currently in node you'll need to run with --harmony_proxies flag
 * note: this uses deasync, which mucks around with async functions in the eventloop to make them sync functions
 * 
 * note: this object exposes two dictionaries - keys and secrets. ie: instance.keys, instance.secrets
 * 
 * 
 * @param vaultUrl {String} the url to a keyvault
 * @param credentials {keyvault.KeyVaultCredentials} the credentials to access the keyvault
 */
function KVDict(vaultUrl, credentials) {
    // throw if our vaultUrl is invalid
    if (typeof(vaultUrl) !== "string") {
        throw new Error("vaultUrl should be a string");
    }
    // throw if our credentials is invalid
    if (!(credentials instanceof keyvault.KeyVaultCredentials)) {
        throw new Error("credentials should be a azure-keyvault.KeyVaultCredentials object");
    }
    
    // create the keyvault client
    let client = new keyvault.KeyVaultClient(credentials);

    // since keyvault api is async and dictionary
    // gets and sets are not, we deasync these calls
    let setSecretSync = deasync(client.setSecret);
    let getSecretSync = deasync(client.getSecret);
    let createKeySync = deasync(client.createKey);
    let getKeySync = deasync(client.getKey);

    // use an es6 proxy to handle gets/sets for secrets
    let secrets = Proxy.create({
        set: function (receiver, index, value) {
            if (typeof(index) !== "string") {
                throw new Error("index must be a string");
            }
            if (typeof(value) !== "string") {
                throw new Error("value must be a string");
            }
            dummy[index] = value;
            setSecretSync(vaultUrl, index, {value: value});
        },
        get: function (receiver, index) {
            return {
                data: getSecretSync(index),
                delete: client.deleteSecret.bind(client, vaultUrl, index)
            };
        }
    });
    
    // use an es6 proxy to handle gets/sets for keys
    let keys = Proxy.create({
        set: function (receiver, index, value) {
            // check that our value looks like a keyvault key
            if (typeof(value.kty) === "undefined") {
                throw new Error("value must be a valid keyvault key object.");
            }
            
            createKeySync(vaultUrl, index, value);
        },
        get: function (receiver, index) {
            return {
                data: getKeySync(index),
                encrypt: client.encrypt.bind(client, index),
                decrypt: client.decrypt.bind(client, index),
                sign: client.sign.bind(client, index),
                verify: client.verify.bind(client, index),
                wrap: client.wrapKey.bind(client, index),
                unwrap: client.unwrapKey.bind(client, index),
                delete: client.deleteKey.bind(client, vaultUrl, index),
                update: client.updateKey.bind(client, index),
                backup: client.backupKey.bind(client, vaultUrl, index)
            };
        }
    });
    
    // finally, store these objects on `this`
    this.keys = keys;
    this.secrets = secrets;
}

// export our constructor
module.exports = {
    KVDict: KVDict,
    KeyVaultCredentials: keyvault.KeyVaultCredentials
};