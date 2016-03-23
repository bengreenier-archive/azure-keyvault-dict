azure-keyvault-dict
===================
> Note: this requires support for ES6 Proxies! In node that means running with the `--harmony_proxies` flag for the time being.

work with azure-keyvault as if it was a simple key-value store

# How do I...

## Install this module?

> Note: This hasn't shipped yet! Still in progress.

`npm install azure-keyvault-dict`

## Use the module?

```
var azkvdict = require('azure-keyvault-dict');

var creds = new azkvdict.KeyVaultCredentials();
var vaultUrl = "https://myvault.vault.azure.net";

var mydict = new azkvdict.KVDict(vaultUrl, creds);

mydict.secrets["new"] = "storeme";
console.log(mydict.secrets["new"]); // storeme

mydict.keys["new"] = {kty: "RSA", key_ops: ["encrypt", "decrypt"]};
mydict.keys["new"].decrypt("blobtodecrypt");
```

## Run the tests?

+ `git clone https://github.com/bengreenier/azure-keyvault-dict`
+ `cd azure-keyvault-dict`
+ `npm install`
+ `npm test`


