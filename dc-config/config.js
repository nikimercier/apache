
/**
 * Promised Event Emitter
 * @link      http://github.com/dragoscirjan/nodejs-config for the canonical source repository
 * @link      https://github.com/dragoscirjan/nodejs-config/issues for issues and support
 * @license   https://github.com/dragoscirjan/nodejs-config/blob/master/LICENSE MIT
 */

(function() {
  var Config, EnvironmentalConfig, _extend,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  _extend = require('extend');


  /**
   * Config Class, used to load, store, fetch, write config settings in JSON, XML or YAML.
   *
   * @link https://www.npmjs.com/package/read-yaml for YAML
   * @link https://www.npmjs.com/package/write-yaml for YAML
   * @link https://www.npmjs.com/package/xml for XML
   * @link https://www.npmjs.com/package/xml2json for XML
   */

  Config = (function() {

    /** @var {Object} */
    Config.prototype.config = {};


    /**
     * Constructor
     * @param {String} path Config file path
     */

    function Config(path) {
      this.path = path != null ? path : '';
      this.pathHandler = require('path');
      this.config = {};
      null;
    }


    /**
     * Obtain a config value
     * @param {String} configPath
     * @return {mixed}
     */

    Config.prototype.get = function(configPath, config) {
      if (config == null) {
        config = null;
      }
      config = config ? config : this.config;
      return configPath.split('.').reduce((function(obj, i) {
        return obj[i];
      }), _extend(true, {}, config));
    };


    /**
     * Determine if a config path exists or not.
     * @return {Boolean} TRUE if config path exists, FALSE otherwise
     */

    Config.prototype.has = function(configPath, config) {
      var chunks, key, result;
      if (config == null) {
        config = null;
      }
      config = config ? config : this.config;
      config = _extend(true, {}, config);
      result = true;
      chunks = configPath.split('.');
      if (chunks.length === 1) {
        result = typeof config[chunks.shift()] !== 'undefined';
      } else {
        while (chunks.length) {
          key = chunks.shift();
          if (typeof config[key] === 'undefined') {
            result = false;
            break;
          }
          config = config[key];
        }
      }
      return result;
    };


    /**
     * Set a config value
     * @param {String} configPath
     * @param {mixed} value
     * @return void
     */

    Config.prototype.set = function(configPath, value, config) {
      var chunks;
      if (config == null) {
        config = null;
      }
      config = config ? config : this.config;
      chunks = configPath.split('.');
      config = chunks.slice(0, chunks.length - 1).reduce((function(obj, i) {
        return obj[i];
      }), config);
      config[chunks.pop()] = value;
      return null;
    };


    /**
     * Read config file
     * Will throw Error if
     *     - conversion fails
     *     - read fails
     * @return {Object} Promise
     * @throws Error
     */

    Config.prototype.read = function() {
      var defered, ext, genCallback, parser, readYaml, self;
      self = this;
      defered = require('q').defer();
      genCallback = function(parser) {
        var callback;
        callback = function(err, data) {
          if (!err) {
            self.config = parser(data);
            defered.resolve(self);
            return;
          }
          defered.reject(err);
          throw err;
        };
        return callback;
      };
      ext = this.pathHandler.extname(this.path).toUpperCase();
      switch (ext) {
        case '.JSON':
          require('fs').readFile(this.path, {
            encoding: 'UTF-8'
          }, genCallback(function(data) {
            return JSON.parse(data);
          }));
          break;
        case '.XML':
          parser = function(data) {
            return JSON.parse(require('xml2json').toJson(data)).root;
          };
          require('fs').readFile(this.path, {
            encoding: 'UTF-8'
          }, genCallback(parser));
          break;
        case '.YAML':
        case '.YML':
          readYaml = require('read-yaml');
          readYaml(this.path, genCallback(function(data) {
            return data;
          }));
          break;
        default:
          throw new Error("Unknown file extension for config file: '" + ext + "'.");
      }
      return defered.promise;
    };


    /**
     * Read config file
     * Will throw Error if
     *     - conversion fails
     *     - read fails
     * @return {Object} Config
     * @throws Error
     */

    Config.prototype.readSync = function() {
      var ext, xml;
      ext = this.pathHandler.extname(this.path).toUpperCase();
      switch (ext) {
        case '.JSON':
          this.config = JSON.parse(require('fs').readFileSync(this.path, {
            encoding: 'UTF-8'
          }));
          break;
        case '.XML':
          xml = require('fs').readFileSync(this.path, {
            encoding: 'UTF-8'
          });
          this.config = JSON.parse(require('xml2json').toJson(xml)).root;
          break;
        case '.YAML':
        case '.YML':
          this.config = require('read-yaml').sync(this.path);
          break;
        default:
          throw new Error("Unknown file extension for config file: '" + ext + "'.");
      }
      return this.config;
    };


    /**
     * Writes config file
     * Will throw Error if
     * - conversion fails
     * - write fails
     * @throws Error
     * @return {Object} Promise
     */

    Config.prototype.write = function() {
      var callback, defered, ext, self, writeYaml, xml;
      self = this;
      defered = require('q').defer();
      callback = function(err) {
        if (!err) {
          defered.resolve(self);
          return;
        }
        defered.reject(err);
        throw err;
      };
      ext = this.pathHandler.extname(this.path).toUpperCase();
      switch (ext) {
        case '.JSON':
          require('fs').writeFile(this.path, JSON.stringify(this.config, null, 4), {
            encoding: 'UTF-8'
          }, callback);
          break;
        case '.XML':
          xml = require('xml');
          require('fs').writeFile(this.path, xml(this._prepareForXml({
            root: this.config
          }), true), {
            encoding: 'UTF-8'
          }, callback);
          break;
        case '.YAML':
        case '.YML':
          writeYaml = require('write-yaml');
          writeYaml(this.path, this.config, callback);
          break;
        default:
          throw new Error("Unknown file extension for config file: '" + ext + "'.");
      }
      return defered.promise;
    };


    /**
     * Writes config file
     * Will throw Error if
     * - conversion fails
     * - write fails
     * @throws Error
     */

    Config.prototype.writeSync = function() {
      var ext, xml;
      ext = this.pathHandler.extname(this.path).toUpperCase();
      switch (ext) {
        case '.JSON':
          require('fs').writeFileSync(this.path, JSON.stringify(this.config, null, 4), {
            encoding: 'UTF-8'
          });
          break;
        case '.XML':
          xml = require('xml');
          require('fs').writeFileSync(this.path, xml(this._prepareForXml({
            root: this.config
          }), true), {
            encoding: 'UTF-8'
          });
          break;
        case '.YAML':
        case '.YML':
          require('write-yaml').sync(this.path, this.config);
          break;
        default:
          throw new Error("Unknown file extension for config file: '" + ext + "'.");
      }
      return null;
    };


    /**
     * Prepare (format/embed) object for XML convesion
     * @param {Object} obj
     * @return {Object}
     */

    Config.prototype._prepareForXml = function(obj) {
      var key, nobj, tobj, val;
      nobj = [];
      for (key in obj) {
        val = obj[key];
        tobj = {};
        if (Object.prototype.toString.call(val) === '[object Array]') {
          throw new Error('XML config does not support array type. We\'re working # on fixing the problem in future releases.');
        } else {
          if (typeof val === 'object') {
            tobj[key] = this._prepareForXml(val);
          } else {
            tobj[key] = {
              _cdata: val
            };
          }
        }
        nobj.push(tobj);
      }
      return nobj;
    };

    return Config;

  })();

  EnvironmentalConfig = (function(superClass) {
    extend(EnvironmentalConfig, superClass);


    /**
     * Constructor
     * @param {String} path Config file path
     * @param {String} env  Config environment
     */

    function EnvironmentalConfig(path, env1) {
      this.path = path != null ? path : '';
      this.env = env1 != null ? env1 : 'production';
      EnvironmentalConfig.__super__.constructor.call(this, this.path);
    }


    /**
     * Obtain a config value
     * @param {String} configPath
     * @return {mixed}
     */

    EnvironmentalConfig.prototype.get = function(configPath, config, env) {
      if (config == null) {
        config = null;
      }
      if (env == null) {
        env = 'production';
      }
      env = this.env ? this.env : env;
      config = config ? config : this.config;
      config = config[env] ? config[env] : {};
      return EnvironmentalConfig.__super__.get.call(this, configPath, config);
    };


    /**
     * Determine if a config path exists or not.
     * @return {Boolean} TRUE if config path exists, FALSE otherwise
     */

    EnvironmentalConfig.prototype.has = function(configPath, config, env) {
      if (config == null) {
        config = null;
      }
      if (env == null) {
        env = 'production';
      }
      env = this.env ? this.env : env;
      config = config ? config : this.config;
      config = config[env] ? config[env] : {};
      return EnvironmentalConfig.__super__.has.call(this, configPath, config);
    };


    /**
     * Set a config value
     * @param {String} configPath
     * @param {mixed} value
     * @return void
     */

    EnvironmentalConfig.prototype.set = function(configPath, value, config, env) {
      if (config == null) {
        config = null;
      }
      if (env == null) {
        env = 'production';
      }
      env = this.env ? this.env : env;
      config = config ? config : this.config;
      config = config[env] ? config[env] : {};
      return EnvironmentalConfig.__super__.set.call(this, configPath, value, config);
    };

    return EnvironmentalConfig;

  })(Config);

  Config.Environmental = EnvironmentalConfig;

  module.exports = Config;

}).call(this);
