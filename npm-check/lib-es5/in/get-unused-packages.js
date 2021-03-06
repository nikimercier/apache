'use strict';

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var depcheck = require('depcheck');
var ora = require('ora');
var _ = require('lodash');

function skipUnused(currentState) {
    return currentState.get('skipUnused') || // manual option to ignore this
    currentState.get('global') || // global modules
    currentState.get('update') || // in the process of doing an update
    !currentState.get('cwdPackageJson').name; // there's no package.json
}

function checkUnused(currentState) {
    var spinner = ora('Checking for unused packages. --skip-unused if you don\'t want this.');
    spinner.enabled = spinner.enabled && currentState.get('spinner');
    spinner.start();

    return new _promise2.default(function (resolve) {
        if (skipUnused(currentState)) {
            resolve(currentState);
        }

        var depCheckOptions = {
            ignoreDirs: ['sandbox', 'dist', 'generated', '.generated', 'build', 'fixtures'],
            ignoreMatches: ['gulp-*', 'grunt-*', 'karma-*', 'angular-*', 'babel-*', 'metalsmith-*', 'grunt', 'mocha', 'ava']
        };

        depcheck(currentState.get('cwd'), depCheckOptions, resolve);
    }).then(function (depCheckResults) {
        spinner.stop();
        var unusedDependencies = [].concat(depCheckResults.dependencies, depCheckResults.devDependencies);
        currentState.set('unusedDependencies', unusedDependencies);

        var cwdPackageJson = currentState.get('cwdPackageJson');

        // currently missing will return devDependencies that aren't really missing
        var missingFromPackageJson = _.omit(depCheckResults.missing || {}, (0, _keys2.default)(cwdPackageJson.dependencies), (0, _keys2.default)(cwdPackageJson.devDependencies));
        currentState.set('missingFromPackageJson', missingFromPackageJson);
        return currentState;
    });
}

module.exports = checkUnused;