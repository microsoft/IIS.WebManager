/* tslint:disable */
'use strict';
exports.__esModule = true;
var through2 = require("through2");
var gutil = require("gulp-util");
var Path = require("path");
var Vinyl = require("vinyl");
var SvgCode = require("./svg-code-convert");
var PluginError = gutil.PluginError;
var PLUGIN_NAME = 'gulp-svg-code';
/**
 * Plugin level function
 */
function gulpSvgCode() {
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
    var pathPrefix = null;
    var collection = {};
    return through2.obj(function (file, enc, cb) {
        var error = null;
        try {
            var path = Path.parse(file.path);
            if (path.ext === '.svg') {
                if (pathPrefix === null) {
                    pathPrefix = path.dir;
                }
                else {
                    var segments = path.dir.split('\\');
                    var segPrefix = pathPrefix.split('\\');
                    var newPrefix = [];
                    for (var i = 0; i < segPrefix.length; i++) {
                        if (segments[i].toLocaleUpperCase() !== segPrefix[i].toLocaleUpperCase()) {
                            pathPrefix = newPrefix.join('\\');
                            break;
                        }
                        newPrefix.push(segments[i]);
                    }
                }
                var data = file.contents.toString('utf8');
                collection[file.path] = data;
            }
        }
        catch (e) {
            error = (!e.plugin || (e.plugin !== PLUGIN_NAME)) ? extendError(new PluginError(PLUGIN_NAME, e.message), e) : e;
        }
        return cb(error);
    }, function (cb) {
        var converter = new SvgCode.SvgCodeConverter();
        converter.contentReset();
        converter.generate(collection, pathPrefix);
        var cssFile = new Vinyl({
            cwd: '/',
            base: pathPrefix,
            path: pathPrefix + '\\svg.css',
            contents: new Buffer(converter.contentCss)
        });
        this.push(cssFile);
        var tsFile = new Vinyl({
            cwd: '/',
            base: pathPrefix,
            path: pathPrefix + '\\svg.ts',
            contents: new Buffer(converter.contentTs)
        });
        this.push(tsFile);
        cb();
    });
}
module.exports = gulpSvgCode;
