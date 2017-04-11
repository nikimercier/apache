###*
 * Promised Event Emitter
 * @link      http://github.com/dragoscirjan/nodejs-config for the canonical source repository
 * @link      https://github.com/dragoscirjan/nodejs-config/issues for issues and support
 * @license   https://github.com/dragoscirjan/nodejs-config/blob/master/LICENSE MIT
###

_extend = require 'extend'

###*
 * Config Class, used to load, store, fetch, write config settings in JSON, XML or YAML.
 *
 * @link https://www.npmjs.com/package/read-yaml for YAML
 * @link https://www.npmjs.com/package/write-yaml for YAML
 * @link https://www.npmjs.com/package/xml for XML
 * @link https://www.npmjs.com/package/xml2json for XML
###
class Config

    ###* @var {Object} ###
    config: {}

    ###*
     * Constructor
     * @param {String} path Config file path
    ###
    constructor: (@path = '') ->
        @pathHandler = require 'path'
        @config = {}
        null

    ###*
     * Obtain a config value
     * @param {String} configPath
     * @return {mixed}
    ###
    get: (configPath, config = null) ->
        # @link http://stackoverflow.com/questions/6393943/convert-javascript-string-in-dot-notation-into-an-object-reference
        config = if config then config else @config

        configPath.split('.').reduce ((obj, i) -> obj[i]), (_extend true, {}, config)

    ###*
     * Determine if a config path exists or not.
     * @return {Boolean} TRUE if config path exists, FALSE otherwise
    ###
    has: (configPath, config = null) ->
        config = if config then config else @config
        config = _extend true, {}, config

        result = true
        chunks = configPath.split '.'
        if chunks.length == 1
            result = typeof config[chunks.shift()] != 'undefined'
        else
            while chunks.length
                key = chunks.shift()
                if typeof config[key] == 'undefined'
                    result = false
                    break
                config = config[key]
        result

    ###*
     * Set a config value
     * @param {String} configPath
     * @param {mixed} value
     * @return void
    ###
    set: (configPath, value, config = null) ->
        config = if config then config else @config

        chunks = configPath.split '.'
        config = chunks.slice(0, chunks.length - 1).reduce ((obj, i) -> obj[i]), config
        config[chunks.pop()] = value
        null

    ###*
     * Read config file
     * Will throw Error if
     *     - conversion fails
     *     - read fails
     * @return {Object} Promise
     * @throws Error
    ###
    read: () ->
        self = @
        defered = require('q').defer()
        genCallback = (parser) ->
            callback = (err, data) ->
                if (!err)
                    self.config = parser data
                    defered.resolve self
                    return
                defered.reject err
                throw err
            callback
        ext = @pathHandler.extname(@path).toUpperCase()
        switch (ext)
            when '.JSON'
                require('fs').readFile @path, {encoding: 'UTF-8'}, genCallback((data) -> JSON.parse data)
            when '.XML'
                parser = (data) -> JSON.parse(require('xml2json').toJson(data)).root
                require('fs').readFile @path, {encoding: 'UTF-8'}, genCallback(parser)
            when '.YAML', '.YML'
                readYaml = require('read-yaml')
                readYaml @path, genCallback((data) -> data)
            else
                throw new Error "Unknown file extension for config file: '#{ext}'."
        defered.promise

    ###*
     * Read config file
     * Will throw Error if
     *     - conversion fails
     *     - read fails
     * @return {Object} Config
     * @throws Error
    ###
    readSync: () ->
        ext = @pathHandler.extname(@path).toUpperCase()
        switch (ext)
            when '.JSON'
                @config = JSON.parse(require('fs').readFileSync(@path, {encoding: 'UTF-8'}))
            when '.XML'
                xml = require('fs').readFileSync(@path, {encoding: 'UTF-8'})
                # console.log require('xml2json').toJson(xml)
                @config = JSON.parse(require('xml2json').toJson(xml)).root
            when '.YAML', '.YML'
                @config = require('read-yaml').sync(@path)
            else
                throw new Error "Unknown file extension for config file: '#{ext}'."
        @config

    ###*
     * Writes config file
     * Will throw Error if
     * - conversion fails
     * - write fails
     * @throws Error
     * @return {Object} Promise
    ###
    write: () ->
        self = @
        defered = require('q').defer()
        callback = (err) ->
            if (!err)
                defered.resolve self
                return
            defered.reject err
            throw err
        ext = @pathHandler.extname(@path).toUpperCase()
        switch (ext)
            when '.JSON'
                require('fs').writeFile @path, JSON.stringify(@config, null, 4), {encoding: 'UTF-8'}, callback
            when '.XML'
                xml = require 'xml'
                require('fs').writeFile @path, xml(@_prepareForXml({root: @config}), true), {encoding: 'UTF-8'}, callback
            when '.YAML', '.YML'
                writeYaml = require('write-yaml')
                writeYaml @path, @config, callback
            else
                throw new Error "Unknown file extension for config file: '#{ext}'."
        defered.promise

    ###*
     * Writes config file
     * Will throw Error if
     * - conversion fails
     * - write fails
     * @throws Error
    ###
    writeSync: () ->
        ext = @pathHandler.extname(@path).toUpperCase()
        switch (ext)
            when '.JSON'
                require('fs').writeFileSync(@path, JSON.stringify(@config, null, 4), {encoding: 'UTF-8'})
            when '.XML'
                xml = require 'xml'
                # console.log JSON.stringify({root: @config})
                # console.log JSON.stringify(@_prepareForXml({root: @config}))
                # console.log xml(@_prepareForXml({root: @config}), true)
                require('fs').writeFileSync(@path, xml(@_prepareForXml({root: @config}), true), {encoding: 'UTF-8'})
            when '.YAML', '.YML'
                require('write-yaml').sync(@path, @config)
            else
                throw new Error "Unknown file extension for config file: '#{ext}'."
        null

    ###*
     * Prepare (format/embed) object for XML convesion
     * @param {Object} obj
     * @return {Object}
    ###
    _prepareForXml: (obj) ->
        nobj = []
        for key,val of obj
            tobj = {}
            if Object.prototype.toString.call(val) == '[object Array]'
                throw new Error 'XML config does not support array type. We\'re working
                                # on fixing the problem in future releases.'
                # tobj[key] = [{ _attr: { type: 'Array' }}].concat(@_prepareForXml(@_array2Object(val)))
            else
                if typeof val == 'object'
                    tobj[key] = @_prepareForXml(val)
                else
                    tobj[key] = { _cdata: val }
            nobj.push(tobj)
        nobj

    # ###*
    #  * Converting Array into Object, prefixing keys with 'elem' string.
    #  * @param {Array} arr
    #  * @return {Object}
    # ###
    # _array2Object: (arr) ->
    #     obj = {}
    #     for key,val of arr
    #         obj['elem' + key] = val
    #     obj
    #
    # ###*
    #  * Converting Object into Array ignoring keys
    #  * @see Config::_array2Object()
    #  * @param {Object} arr
    #  * @return {Array}
    # ###
    # _object2Array: (obj) ->
    #     arr = []
    #     for key,val of obj
    #         arr.push val
    #     arr


class EnvironmentalConfig extends Config
    ###*
     * Constructor
     * @param {String} path Config file path
     * @param {String} env  Config environment
    ####
    constructor: (@path = '', @env = 'production') ->
        super(@path)

    ###*
     * Obtain a config value
     * @param {String} configPath
     * @return {mixed}
    ###
    get: (configPath, config = null, env = 'production') ->
        env = if @env then @env else env
        config = if config then config else @config
        config = if config[env] then config[env] else {}
        super(configPath, config)

    ###*
     * Determine if a config path exists or not.
     * @return {Boolean} TRUE if config path exists, FALSE otherwise
    ###
    has: (configPath, config = null, env = 'production') ->
        env = if @env then @env else env
        config = if config then config else @config
        config = if config[env] then config[env] else {}
        super(configPath, config)

    ###*
     * Set a config value
     * @param {String} configPath
     * @param {mixed} value
     * @return void
    ###
    set: (configPath, value, config = null, env = 'production') ->
        env = if @env then @env else env
        config = if config then config else @config
        config = if config[env] then config[env] else {}
        super(configPath, value, config)

Config.Environmental = EnvironmentalConfig

module.exports = Config
