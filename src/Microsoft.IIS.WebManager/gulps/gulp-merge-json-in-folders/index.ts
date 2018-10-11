/* tslint:disable */
'use strict';
import gutil = require('gulp-util');
import through2 = require('through2');
import jsonMerge = require('./json-merge');

let PluginError = gutil.PluginError;
let PLUGIN_NAME = 'gulp-merge-json-in-folders';

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

    let externalSources: string[] = [];

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
            try {
                const merge = new jsonMerge.JsonMerge();
                const files = merge.mergeJsonInFolders(options.src, externalSources);
                files.forEach(file => this.push(file));
            } catch (e) {
                let error = (!e.plugin || (e.plugin !== PLUGIN_NAME)) ? extendError(new PluginError(PLUGIN_NAME, e.message), e) : e;
                gutil.log(error);
            }

            callback();
        });

};

module.exports = gulpMergeJsonInFolders;