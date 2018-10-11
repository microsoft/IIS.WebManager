/* tslint:disable */
'use strict';
import through2 = require('through2');
import gutil = require('gulp-util');
import Path = require('path');
import Resjson = require('./resjson-convert');
import Vinyl = require('vinyl');

let PluginError = gutil.PluginError;
let PLUGIN_NAME = 'gulp-resjson';

function gulpResjson(options) {
    //
    // (Options):
    //
    // enable to produce xxxx.d.ts file.
    //   definition: string; { null, 'module' }
    //
    // enable to produce xxxx.ts file.
    //   typescript: string; { null, 'module', 'interface' }
    //
    // enable to produce xxxx.json file.
    //   json: boolean;
    //
    // if set a space charactors, it adds formating of JSON.
    // it set null, space will be eliminated.
    //   jsonSpace: string | number;
    //

    // override options settings if not specified.
    options = Object.assign({ definition: null, typescript: null, json: false, jsonSpace: null }, options || {});

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

    return through2.obj(
        /**
         * @this {Transform}
         */
        function (file, encoding, callback) {
            let error = null;
            try {
                if (file.isNull()) {
                    // nothing to do
                    return callback(null, file);
                }

                if (file.isStream()) {
                    // file.contents is a Stream - https://nodejs.org/api/stream.html
                    this.emit('error', new PluginError(PLUGIN_NAME, 'Streams not supported!'));
                    return callback(null, file);
                } else if (file.isBuffer()) {
                    let data = file.contents.toString('utf8');
                    let converter = new Resjson.ResJsonConverter(options);
                    converter.convert(data);

                    let path = Path.parse(file.path);
                    if (options.definition) {
                        let dtFile = new Vinyl({
                            cwd: '/',
                            base: path.dir,
                            path: path.dir + '/' + path.name + '.d.ts',
                            contents: new Buffer(converter.contentDefinition)
                        });
                        this.push(dtFile);
                    }

                    if (options.typescript) {
                        let content = options.typescript === 'interface' ? converter.contentInterface : converter.contentTypescript;
                        let tsFile = new Vinyl({
                            cwd: '/',
                            base: path.dir,
                            path: path.dir + '/' + path.name + '.ts',
                            contents: new Buffer(content)
                        });
                        this.push(tsFile);
                    }

                    if (options.json) {
                        let base = options.srcRoot || path.dir;
                        let content = JSON.stringify(converter.outputJson, null, options.jsonSpace);
                        let jsonFile = new Vinyl({
                            cwd: '/',
                            base: base,
                            path: path.dir + '\\' + path.name + '.json',
                            contents: new Buffer(content)
                        });
                        this.push(jsonFile);
                    }
                }
            } catch (e) {
                error = (!e.plugin || (e.plugin !== PLUGIN_NAME)) ? extendError(new PluginError(PLUGIN_NAME, e.message), e) : e;
            }

            callback(error);
        });
};

module.exports = gulpResjson
