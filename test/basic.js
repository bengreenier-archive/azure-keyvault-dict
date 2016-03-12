'use strict';

const keyvault = require('azure-keyvault');
const KVDict = require('../lib/index');
const assert = require('assert');

describe("KVDict", function () {
    it("should fail construction with bad args", function () {
        assert.throws(function () {
            var i = new KVDict(1, 10);        
        }, /vaultUrl should be/);
        assert.throws(function () {
            var i = new KVDict("", 10);        
        }, /credentials should be/);
    });
    
    it("should succeed construction with good args", function () {
        var i = new KVDict("test", new keyvault.KeyVaultCredentials());
    });
    
});