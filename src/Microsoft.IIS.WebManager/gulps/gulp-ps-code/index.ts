/* tslint:disable */
'use strict';

import through2 = require('through2');
import gutil = require('gulp-util');
import Path = require('path');
import Vinyl = require('vinyl');
import PsCode = require('./ps-code-convert');

let PluginError = gutil.PluginError;
let PLUGIN_NAME = 'gulp-ps-code';

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

	let collection = {};
	let lastFile = null;

	return through2.obj(
		function (file, enc, cb) {
			let error = null;
			try {
				let path = Path.parse(file.path);
				if (path.ext === '.ps1') {
					if (collection[path.base]) {
						throw new Error('gulp-ps-code requires unique name of ps file, conflicted with ' + path.base);
					}

					let data = file.contents.toString('utf8');
					collection[path.base] = data;
					lastFile = file;
				}
			} catch (e) {
				error = (!e.plugin || (e.plugin !== PLUGIN_NAME)) ? extendError(new PluginError(PLUGIN_NAME, e.message), e) : e;
			}

			return cb(error);
		},
		function (cb) {
			let converter = new PsCode.PsCodeConverter();
			converter.contentReset();
			converter.generate(collection);

			let tsFile = new Vinyl({
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
