"use strict";
exports.__esModule = true;
var fs = require('fs');
var fsPath = require('path');
var readlineSync = require('readline-sync');
var gutil = require('gulp-util');
var Vinyl = require('vinyl');
var JsonMerge = (function () {
    function JsonMerge() {
    }
    /**
     * Recursively merges JSON files with the same name and same subPath from the sourceFolders into the JSON files
     * in the targetFolderPath.
     *
     * @example
     *  src/assets/resources/strings/ <- targetFolderPath
     *                              strings.json
     *                              es/strings.json
     *                              pt/strings.json
     * [
     *     'node_modules/@msft-sme/core/dist/assets/resources/strings',
     *     'node_modules/@msft-sme/ng2/dist/assets/resources/strings'
     * ] <- sourceFoldersPath
     *
     *                               src/assets/resources/strings/strings.json contents are merged with the contents of
     *  node_modules/@msft-sme/core/dist/assets/resources/strings/strings.json and
     *  node_modules/@msft-ng2/core/dist/assets/resources/strings/strings.json
     *  and the source file is overwritten by the merged content
     *
     * @param targetFolderPathRoot {string} The path of the base folder where the destination files are placed.
     * @param sourceFoldersPathRoot {string[]} The array of paths to the source folders from where to read the JSON files to merge
     */
    JsonMerge.prototype.mergeJsonInFolders = function (targetFolderPathRoot, sourceFoldersPathRoot) {
        var _this = this;
        var outputFiles = [];
        var targetFilesContentMap = {};
        var targetFiles = this.getFilePaths(targetFolderPathRoot);
        targetFiles.forEach(function (targetFile) {
            var relativePath = targetFile.substring(targetFolderPathRoot.length + 1, targetFile.length);
            targetFilesContentMap[relativePath] = _this.readJSON(targetFile);
        });
        sourceFoldersPathRoot.forEach(function (sourceFolderPathRoot) {
            var sourceFiles = _this.getFilePaths(sourceFolderPathRoot);
            sourceFiles.forEach(function (sourceFile) {
                var relativePath = sourceFile.substring(sourceFolderPathRoot.length + 1, sourceFile.length);
                var sourceJson = _this.readJSON(sourceFile);
                _this.mergeJsons(relativePath, sourceJson, targetFilesContentMap);
            });
        });
        Object.keys(targetFilesContentMap).forEach(function (path) {
            var jsonFile = new Vinyl({
                cwd: './',
                path: path,
                contents: new Buffer(JSON.stringify(targetFilesContentMap[path]))
            });
            outputFiles.push(jsonFile);
        });
        return outputFiles;
    };
    JsonMerge.prototype.getFilePaths = function (dir, paths) {
        var _this = this;
        if (paths === void 0) { paths = []; }
        if (!dir.endsWith('/')) {
            dir += '/';
        }
        var files = fs.readdirSync(dir);
        files.forEach(function (file) {
            var filePath = dir + file;
            if (fs.statSync(filePath).isDirectory()) {
                paths.concat(_this.getFilePaths(filePath, paths));
            }
            else {
                paths.push(dir + file);
            }
        });
        return paths;
    };
    JsonMerge.prototype.mergeJsons = function (relativePath, sourceJson, targetFilesContentMap) {
        if (targetFilesContentMap[relativePath]) {
            this.extend(targetFilesContentMap[relativePath], [sourceJson]);
        }
        else {
            targetFilesContentMap[relativePath] = sourceJson;
        }
    };
    JsonMerge.prototype.readJSON = function (path) {
        return JSON.parse(fs.readFileSync(path, 'utf8'));
    };
    JsonMerge.prototype.isObject = function (value) {
        return value !== null && typeof value === 'object';
    };
    JsonMerge.prototype.isFunction = function (value) {
        return typeof value === 'function';
    };
    JsonMerge.prototype.extend = function (dest, sources) {
        if (!sources || sources.length === 0) {
            return dest;
        }
        for (var i = 0; i < sources.length; i++) {
            var src = sources[i];
            // Cant extend primitives or null/undefined values. so skip them
            if (!this.isObject(src) && !this.isFunction(src)) {
                continue;
            }
            var keys = Object.keys(src);
            var ki = keys.length;
            while (ki--) {
                var srcField = keys[ki];
                var srcValue = src[srcField];
                var destValue = srcValue;
                if (this.isObject(srcValue) && !Array.isArray(srcValue)) {
                    destValue = {};
                    this.extend(destValue, [dest[srcField], srcValue]);
                }
                dest[srcField] = destValue;
            }
        }
        return dest;
    };
    return JsonMerge;
}());
exports.JsonMerge = JsonMerge;
