"use strict";
exports.__esModule = true;
var SvgCodeConverter = (function () {
    function SvgCodeConverter() {
        this.outputCss = [];
        this.outputTs = [];
    }
    Object.defineProperty(SvgCodeConverter.prototype, "contentCss", {
        get: function () {
            return this.outputCss.join('');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SvgCodeConverter.prototype, "contentTs", {
        get: function () {
            return this.outputTs.join('');
        },
        enumerable: true,
        configurable: true
    });
    SvgCodeConverter.prototype.contentReset = function () {
        this.outputCss = [];
        this.outputTs = [];
    };
    SvgCodeConverter.prototype.generate = function (collection, pathPrefix) {
        var root = this.createStructure(collection, pathPrefix);
        this.outputCss.push(SvgCodeConverter.openContentCss);
        this.outputTs.push(SvgCodeConverter.openContentTs);
        this.addData(root, []);
        this.outputTs.push(SvgCodeConverter.closeContentTs);
    };
    SvgCodeConverter.prototype.addData = function (current, segments) {
        var _this = this;
        var ignores = ['<?xml', '<!-- Generator:', '<!DOCTYPE'];
        var nested = [];
        var keys = Object.keys(current);
        var _loop_1 = function (key) {
            var content = current[key];
            segments.push(key);
            if (typeof content === 'object') {
                var segs = segments.slice(0);
                nested.push({ content: content, segs: segs });
            }
            else if (typeof content === 'string') {
                var cssName = '.svg-' + segments.join('--');
                this_1.outputCss.push(cssName + ' {\r\n');
                this_1.outputCss.push(this_1.indent(1) + 'background-image: url("data:image/svg+xml;');
                this_1.outputTs.push(this_1.indent(segments.length) + 'export const ' + key + ' = \'');
                var lines = content.split('\r');
                var svg_1 = '';
                lines.forEach(function (value, index, array) {
                    value = value.replace('\n', '');
                    if (value && value.length > 1) {
                        var skip = false;
                        for (var _i = 0, ignores_1 = ignores; _i < ignores_1.length; _i++) {
                            var item = ignores_1[_i];
                            if (value.indexOf(item) >= 0) {
                                skip = true;
                                break;
                            }
                        }
                        if (!skip) {
                            svg_1 += value;
                            // this.outputCss.push(value);
                            _this.outputTs.push(value);
                        }
                    }
                });
                svg_1 = this_1.replaceAll(svg_1, '"', '\'');
                svg_1 = this_1.replaceAll(svg_1, '%', '%25');
                svg_1 = this_1.replaceAll(svg_1, '#', '%23');
                svg_1 = this_1.replaceAll(svg_1, '{', '%7B');
                svg_1 = this_1.replaceAll(svg_1, '}', '%7D');
                svg_1 = this_1.replaceAll(svg_1, '<', '%3C');
                svg_1 = this_1.replaceAll(svg_1, '>', '%3E');
                this_1.outputCss.push('charset=utf8,' + svg_1);
                this_1.outputCss.push('");\r\n');
                this_1.outputCss.push('}\r\n');
                this_1.outputCss.push('\r\n');
                this_1.outputTs.push('\';\r\n');
            }
            segments.pop();
        };
        var this_1 = this;
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var key = keys_1[_i];
            _loop_1(key);
        }
        for (var index = 0; index < nested.length; index++) {
            var _a = nested[index], content = _a.content, segs = _a.segs;
            this.outputTs.push(this.indent(segs.length) + 'export module ' + segs[segs.length - 1] + ' {\r\n');
            this.addData(nested[index].content, nested[index].segs);
            this.outputTs.push(this.indent(segs.length) + '}\r\n');
        }
    };
    SvgCodeConverter.prototype.createStructure = function (collection, pathPrefix) {
        var root = {};
        var keys = Object.keys(collection).sort(function (left, right) { return left.toLowerCase().localeCompare(right.toLowerCase()); });
        for (var _i = 0, keys_2 = keys; _i < keys_2.length; _i++) {
            var key = keys_2[_i];
            var shortName = key.substr(0, key.length - '.svg'.length);
            shortName = this.replaceAll(shortName.substr(pathPrefix.length + 1), '-', '_').toLowerCase();
            var segments = shortName.split('\\');
            var current = root;
            for (var index = 0; index < segments.length - 1; index++) {
                var segment = segments[index];
                if (current.hasOwnProperty(segment)) {
                    current = current[segment];
                }
                else {
                    current[segment] = {};
                    current = current[segment];
                }
            }
            current[segments[segments.length - 1]] = collection[key];
        }
        return root;
    };
    SvgCodeConverter.prototype.regexEscape = function (str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
    };
    SvgCodeConverter.prototype.replaceAll = function (input, searchValue, replaceValue) {
        return input.replace(new RegExp(this.regexEscape(searchValue), 'g'), replaceValue);
    };
    SvgCodeConverter.prototype.indent = function (count) {
        var pad = '';
        for (var i = 0; i < count; i++) {
            pad += '    ';
        }
        return pad;
    };
    return SvgCodeConverter;
}());
SvgCodeConverter.openContentTs = "/* tslint:disable */\n/**\n * @file Source code generated by gulp-svg-code.\n * @version 1.0\n */\nexport module Svg {\n    'use strict'\n";
SvgCodeConverter.closeContentTs = "}\n";
SvgCodeConverter.openContentCss = "/**\n * @file Source code generated by gulp-svg-code.\n * @version 1.0\n */\n";
exports.SvgCodeConverter = SvgCodeConverter;
