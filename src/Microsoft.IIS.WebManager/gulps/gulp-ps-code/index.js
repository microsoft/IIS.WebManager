/* tslint:disable */
'use strict';
exports.__esModule = true;
var through2 = require("through2");
var gutil = require("gulp-util");
var Path = require("path");
var Vinyl = require("vinyl");
var PsCode = require("./ps-code-convert");
var PluginError = gutil.PluginError;
var PLUGIN_NAME = 'gulp-ps-code';
/**
 * Plugin level function
 */
function gulpPsCode(options) {
    //
    // (Options):
    //
    // name of generated file.
    //   name: string; default is 'powershell-script.ts'
    //
    // remove comments at default: 
    //   noComments: boolean;
    //
    // override options settings if not specified.
    options = Object.assign({ name: 'powershell-scripts.ts' }, options || {});
    function extendError(pError, error) {
        if (error && (typeof error === 'object')) {
            ['name', 'errno'].forEach(function (property) {
                if (property in error) {
                    this[property] = error[property];
                }
            }, pError);
        }
        return pError;
    }
    var collection = {};
    var lastFile = null;
    return through2.obj(function (file, enc, cb) {
        var error = null;
        try {
            var path = Path.parse(file.path);
            if (path.ext === '.ps1') {
                if (collection[path.base]) {
                    throw new Error('gulp-ps-code requires unique name of ps file, conflicted with ' + path.base);
                }
                var data = file.contents.toString('utf8');
                collection[path.base] = data;
                lastFile = file;
            }
        }
        catch (e) {
            error = (!e.plugin || (e.plugin !== PLUGIN_NAME)) ? extendError(new PluginError(PLUGIN_NAME, e.message), e) : e;
        }
        return cb(error);
    }, function (cb) {
        var converter = new PsCode.PsCodeConverter();
        converter.contentReset();
        converter.generate(collection);
        var tsFile = new Vinyl({
            cwd: lastFile.cwd,
            base: lastFile.base,
            path: lastFile.base + '/' + options.name,
            contents: new Buffer(converter.content)
        });
        this.push(tsFile);
        cb();
    });
}
module.exports = gulpPsCode;
