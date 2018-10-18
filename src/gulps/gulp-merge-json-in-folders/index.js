/* tslint:disable */
'use strict';
exports.__esModule = true;
var gutil = require("gulp-util");
var through2 = require("through2");
var jsonMerge = require("./json-merge");
var PluginError = gutil.PluginError;
var PLUGIN_NAME = 'gulp-merge-json-in-folders';
function gulpMergeJsonInFolders(options) {
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
    //
    // (Options):
    //
    // source path of current folder for 'strings.json'
    //   src: string;
    //
    // override options settings if not specified.
    options = Object.assign({ src: './src/assets/strings' }, options || {});
    var externalSources = [];
    return through2.obj(
    /**
     * @this {Transform}
     */
    function (file, encoding, callback) {
        if (file.isDirectory()) {
            externalSources.push(file.path);
        }
        callback();
    }, 
    /**
     * @this {Flush}
     */
    function (callback) {
        var _this = this;
        try {
            var merge = new jsonMerge.JsonMerge();
            var files = merge.mergeJsonInFolders(options.src, externalSources);
            files.forEach(function (file) { return _this.push(file); });
        }
        catch (e) {
            var error = (!e.plugin || (e.plugin !== PLUGIN_NAME)) ? extendError(new PluginError(PLUGIN_NAME, e.message), e) : e;
            gutil.log(error);
        }
        callback();
    });
}
;
module.exports = gulpMergeJsonInFolders;
