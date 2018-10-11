/* tslint:disable */
'use strict';

import through2 = require('through2');
import gutil = require('gulp-util');
import Path = require('path');
import Vinyl = require('vinyl');
import SvgCode = require('./svg-code-convert');

let PluginError = gutil.PluginError;
let PLUGIN_NAME = 'gulp-svg-code';

/**
 * Plugin level function
 */
function gulpSvgCode() {
	function extendError(pError, error) {
		if (error && (typeof error === 'object')) {
			['name', 'errno'].forEach(
				function (property) {
					if (property in error) {
						this[property] = error[property];
					}
				},
				pError);
		}

		return pError;
	}

	let pathPrefix = null;
	let collection = {};
	return through2.obj(
		function (file, enc, cb) {
			let error = null;
			try {
				let path = Path.parse(file.path);
				if (path.ext === '.svg') {
					if (pathPrefix === null) {
						pathPrefix = path.dir;
					} else {
						let segments = path.dir.split('\\');
						let segPrefix = pathPrefix.split('\\');
						let newPrefix = [];
						for (let i = 0; i < segPrefix.length; i++) {
							if (segments[i].toLocaleUpperCase() !== segPrefix[i].toLocaleUpperCase()) {
								pathPrefix = newPrefix.join('\\');
								break;
							}

							newPrefix.push(segments[i]);
						}
					}

					let data = file.contents.toString('utf8');
					collection[file.path] = data;
				}
			} catch (e) {
				error = (!e.plugin || (e.plugin !== PLUGIN_NAME)) ? extendError(new PluginError(PLUGIN_NAME, e.message), e) : e;
			}

			return cb(error);
		},
		function (cb) {
			let converter = new SvgCode.SvgCodeConverter();
			converter.contentReset();
			converter.generate(collection, pathPrefix);

			let cssFile = new Vinyl({
				cwd: '/',
				base: pathPrefix,
				path: pathPrefix + '\\svg.css',
				contents: new Buffer(converter.contentCss)
			});
			this.push(cssFile);

			let tsFile = new Vinyl({
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
