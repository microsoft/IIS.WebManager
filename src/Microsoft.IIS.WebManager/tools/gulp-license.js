'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var buffer_1 = require("buffer");
var gutil = require("gulp-util");
var Path = require("path");
var through2 = require("through2");
var PLUGIN_NAME = 'gulp-license';
/**
* Plugin level function
*/
function gulpLicense(getLicense) {
    function extendError(pError, error) {
        if (error && (typeof error === 'object')) {
            ['name', 'errno'].forEach(function (property) {
                if (property in error) {
                    // tslint:disable-next-line:no-invalid-this
                    this[property] = error[property];
                }
            }, pError);
        }
        return pError;
    }
    return through2.obj(function (file, enc, cb) {
        try {
            var path = Path.parse(file.path);
            var license = getLicense(path.ext);
            if (license) {
                var contents = file.contents.toString('utf8');
                if(!contents.includes(license)) {
                    contents = license + contents;
                    file.contents = new buffer_1.Buffer(contents);
                }
            }
            return cb(null, file);
        }
        catch (e) {
            var error = (!e.plugin || (e.plugin !== PLUGIN_NAME)) ? extendError(new gutil.PluginError(PLUGIN_NAME, e.message), e) : e;
            return cb(error);
        }
    });
}
module.exports = gulpLicense;