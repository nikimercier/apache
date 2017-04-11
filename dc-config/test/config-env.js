
/* @link https://nodejs.org/api/assert.html */

/**
 * @link http://mochajs.org/
 * @link https://www.npmjs.com/package/assert
 * @link https://github.com/defunctzombie/commonjs-assert
 */

var assert = require('assert')
var path = require('path')

/**
* @var {Object/Config}
*/
var Config = require('../config').Environmental

var oConfig = {
    production: {
        name: 'pool-name-production',
        path: '/tmp/pool/path',
        object: {
            number: 1,
            string: 'string',
            array: ['a', 'b', 'c', 'd']
        }
    },
    development: {
        name: 'pool-name-development',
    }
}

var oConfigNoArray = {
    production: {
        name: 'pool-name-production',
        path: '/tmp/pool/path',
        object: {
            number: 1,
            string: 'string'
        }
    },
    development: {
        name: 'pool-name-development',
    }
}

function readTest(config) {
    assert.equal('pool-name-production', config.config.production.name)
    assert.equal('pool-name-development', config.config.development.name)
    assert.equal('/tmp/pool/path', config.config.production.path)
}

describe('EnvironmentalConfig', function() {

    describe('#readSync()', function() {
        it('should successfully read .json file', function(){
            var config = new Config(path.join(__dirname, 'config-env.json'))
            config.readSync()
            readTest(config)
        })
        it('should successfully read .xml file', function(){
            var config = new Config(path.join(__dirname, 'config-env.xml'))
            config.readSync()
            readTest(config)
        })
        it('should successfully read .yml file', function(){
            var config = new Config(path.join(__dirname, 'config-env.yml'))
            config.readSync()
            readTest(config)
        })
    })

    describe('#read()', function() {
        it('should successfully read .json file', function(done){
            var config = new Config(path.join(__dirname, 'config-env.json'))
            config.read().then(function(c){
                readTest(config)
                done()
            }, done)
        })
        it('should successfully read .xml file', function(done){
            var config = new Config(path.join(__dirname, 'config-env.xml'))
            config.read().then(function(){
                readTest(config)
                done()
            }, done)
        })
        it('should successfully read .yml file', function(done){
            var config = new Config(path.join(__dirname, 'config-env.yml'))
            config.read().then(function(){
                readTest(config)
                done()
            }, done)
        })
    })

    function writeTest(config) {
        // console.log(config.config)
        assert.equal('pool-name-production', config.config.production.name)
        assert.equal('pool-name-development', config.config.development.name)
        assert.equal('/tmp/pool/path', config.config.production.path)
        assert.equal(1, config.config.production.object.number)
        assert.equal('string', config.config.production.object.string)
        assert.equal(true, equals(['a', 'b', 'c', 'd'], config.config.production.object.array))
    }

    function writeTestNoArray(config) {
        // console.log(config.config)
        assert.equal('pool-name-production', config.config.production.name)
        assert.equal('pool-name-development', config.config.development.name)
        assert.equal('/tmp/pool/path', config.config.production.path)
        assert.equal(1, config.config.production.object.number)
        assert.equal('string', config.config.production.object.string)
    }

    // attach the .equals method to Array's prototype to call it on any array
    equals = function (array1, array) {
        // if the other array is a falsy value, return
        if (!array)
            return false;

        // compare lengths - can save a lot of time
        if (array1.length != array.length)
            return false;

        for (var i = 0, l=array1.length; i < l; i++) {
            // Check if we have nested arrays
            if (array1[i] instanceof Array && array1[i] instanceof Array) {
                // recurse into the nested arrays
                if (!array1[i].equals(array1[i]))
                    return false;
            }
            else if (array1[i] != array[i]) {
                // Warning - two different object instances will never be equal: {x:20} != {x:20}
                return false;
            }
        }
        return true;
    }

    describe('#writeSync()', function() {
        it('should successfully write .json file', function(){
            var config = new Config(path.join('/tmp/configSync.json'))
            config.config = oConfig;
            config.writeSync()
            var config2 = new Config(path.join('/tmp/configSync.json'))
            config2.readSync()
            writeTest(config2)
        })
        it('should successfully write .xml file', function(){
            var config = new Config(path.join('/tmp/configSync.xml'))
            config.config = oConfigNoArray;
            config.writeSync()
            var config2 = new Config(path.join('/tmp/configSync.xml'))
            config2.readSync()
            writeTestNoArray(config2)
        })
        it('should successfully write .yml file', function(){
            var config = new Config(path.join('/tmp/configSync.yml'))
            config.config = oConfig;
            config.writeSync()
            var config2 = new Config(path.join('/tmp/configSync.yml'))
            config2.readSync()
            writeTest(config2)
        })
    })

    describe('#write()', function() {
        it('should successfully write .json file', function(done){
            var config = new Config(path.join('/tmp/config-env.json'))
            config.config = oConfig;
            config.write().then(function(){
                var config2 = new Config(path.join('/tmp/config-env.json'))
                config2.readSync()
                writeTest(config2)
                done()
            }, done)
        })
        it('should successfully write .xml file', function(done){
            var config = new Config(path.join('/tmp/config-env.xml'))
            config.config = oConfigNoArray;
            config.write().then(function(){
                var config2 = new Config(path.join('/tmp/config-env.xml'))
                config2.readSync()
                writeTestNoArray(config2)
                done()
            }, done)
        })
        it('should successfully write .yml file', function(done){
            var config = new Config(path.join('/tmp/config-env.yml'))
            config.config = oConfig;
            config.write().then(function(){
                var config2 = new Config(path.join('/tmp/config-env.yml'))
                config2.readSync()
                writeTest(config2)
                done()
            }, done)
        })
    })

    function hasTest(config) {
        assert.equal(true, config.has('name'))
        assert.equal(true, config.has('config'))
        assert.equal(true, config.has('config.path'))
        assert.equal(true, config.has('config.path.to'))
        assert.equal(true, config.has('config.path.to.test'))
        assert.equal(false, config.has('config.my'))
        assert.equal(false, config.has('config.my.path'))

        config.env = 'development'
        assert.equal(true, config.has('name'))
    }

    describe('#has()', function(){
        it('should successfully read .json file and test paths', function(){
            var config = new Config(path.join(__dirname, 'config-env.json'))
            config.readSync()
            hasTest(config)
        })
        it('should successfully read .xml file and test paths', function(){
            var config = new Config(path.join(__dirname, 'config-env.xml'))
            config.readSync()
            hasTest(config)
        })
        it('should successfully read .yml file and test paths', function(){
            var config = new Config(path.join(__dirname, 'config-env.yml'))
            config.readSync()
            hasTest(config)
        })
    })

    function getTest(config) {
        assert.equal('pool-name-production', config.get('name'))
        assert.equal('/tmp/pool/path', config.get('path'))
        assert.equal('value', config.get('config.path.to.test'))

        config.env = 'development'
        assert.equal('pool-name-development', config.get('name'))
    }

    describe('#get()', function(){
        it('should successfully read .json file and match path value', function(){
            var config = new Config(path.join(__dirname, 'config-env.json'))
            config.readSync()
            getTest(config)
        })
        it('should successfully read .xml file and match path value', function(){
            var config = new Config(path.join(__dirname, 'config-env.xml'))
            config.readSync()
            getTest(config)
        })
        it('should successfully read .yml file and match path value', function(){
            var config = new Config(path.join(__dirname, 'config-env.yml'))
            config.readSync()
            getTest(config)
        })
    })

    function setTest(config) {
        config.set('name', 'pool-test')
        assert.equal('pool-test', config.get('name'))
        config.set('config.path.to.test', 'test')
        assert.equal('test', config.get('config.path.to.test'))

        config.env = 'development'
        config.set('name', 'pool-test-development')
        assert.equal('pool-test-development', config.get('name'))
    }

    describe('#set()', function(){
        it('should successfully read .json file and set path value', function(){
            var config = new Config(path.join(__dirname, 'config-env.json'))
            config.readSync()
            setTest(config)
        })
        it('should successfully read .xml file and set path value', function(){
            var config = new Config(path.join(__dirname, 'config-env.xml'))
            config.readSync()
            setTest(config)
        })
        it('should successfully read .yml file and set path value', function(){
            var config = new Config(path.join(__dirname, 'config-env.yml'))
            config.readSync()
            setTest(config)
        })
    })
})
