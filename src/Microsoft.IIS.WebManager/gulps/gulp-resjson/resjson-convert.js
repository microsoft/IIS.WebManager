"use strict";
exports.__esModule = true;
var ResJsonConverter = (function () {
    function ResJsonConverter(options) {
        this.options = options;
    }
    Object.defineProperty(ResJsonConverter.prototype, "contentDefinition", {
        get: function () {
            return this.outputDefinition.join('');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ResJsonConverter.prototype, "contentTypescript", {
        get: function () {
            return this.outputTypescript.join('');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ResJsonConverter.prototype, "contentInterface", {
        get: function () {
            return this.outputInterface.join('');
        },
        enumerable: true,
        configurable: true
    });
    ResJsonConverter.prototype.contentReset = function () {
        this.outputDefinition = [];
        this.outputTypescript = [];
        this.outputInterface = [];
        this.outputJson = {};
        this.jsonCurrent = this.outputJson;
    };
    ResJsonConverter.prototype.convert = function (content) {
        var root = {};
        // Remove comments, /* multilinecomment*/ and // one line comment and "//": "JSON element comment"
        content = content.replace(/(\/\*([^*]|[\n]|(\*+([^*/]|[\n])))*\*\/+)|( +\/\/.*)|(  +\"\/\/\".*)/g, '');
        var data = JSON.parse(content);
        var itemKeys = Object.keys(data);
        // build a data tree.
        for (var _i = 0, itemKeys_1 = itemKeys; _i < itemKeys_1.length; _i++) {
            var itemKey = itemKeys_1[_i];
            // remove localization comments
            if (itemKey.startsWith('//') || (itemKey.startsWith('_') && itemKey.endsWith('.comment'))) {
                continue;
            }
            var current = root;
            var itemValue = data[itemKey];
            var keys = itemKey.split('_');
            var count = keys.length;
            for (var _a = 0, keys_1 = keys; _a < keys_1.length; _a++) {
                var key = keys_1[_a];
                count--;
                if (count > 0) {
                    if (!current.hasOwnProperty(key)) {
                        current[key] = {};
                    }
                    current = current[key];
                    if (typeof current !== 'object') {
                        throw new Error('Resource key already exists: ' + itemKey);
                    }
                }
                else {
                    current[key] = itemValue;
                }
            }
        }
        this.contentReset();
        this.traverse([{ name: 'Strings', value: root }], 0);
    };
    ResJsonConverter.prototype.jsonNewValue = function (name) {
        var old = this.jsonCurrent;
        var json = {};
        this.jsonCurrent[name] = json;
        this.jsonCurrent = json;
        return old;
    };
    ResJsonConverter.prototype.jsonAddValue = function (name, value) {
        this.jsonCurrent[name] = value;
    };
    ResJsonConverter.prototype.scan = function (node) {
        var current = node;
        var keyItems = [];
        var dataItems = [];
        for (var itemKey in current) {
            if (current.hasOwnProperty(itemKey)) {
                var itemValue = current[itemKey];
                if (typeof itemValue === 'object') {
                    keyItems.push({ name: itemKey, value: itemValue });
                }
                else if (typeof itemValue === 'string') {
                    dataItems.push({ name: itemKey, value: itemValue });
                }
            }
        }
        return {
            keyItems: keyItems,
            dataItems: dataItems
        };
    };
    ResJsonConverter.prototype.traverse = function (keyItems, indent) {
        var indentSpace = '    ';
        var indentName = '';
        for (var i = 0; i < indent; i++) {
            indentName += indentSpace;
        }
        var indentValue = indentName + indentSpace;
        if (keyItems.length > 0) {
            for (var _i = 0, keyItems_1 = keyItems; _i < keyItems_1.length; _i++) {
                var item = keyItems_1[_i];
                if (indent === 0) {
                    this.outputDefinition.push(ResJsonConverter.openContent);
                    this.outputTypescript.push(ResJsonConverter.openContent);
                    this.outputInterface.push(ResJsonConverter.openContent);
                    this.outputDefinition.push('export declare module ' + item.name + ' {\r\n');
                    this.outputTypescript.push('export module ' + item.name + ' {\r\n    \'use strict\';\r\n');
                    this.outputInterface.push('export interface ' + item.name + ' {\r\n');
                }
                else {
                    this.outputDefinition.push(indentName + 'module ' + item.name + ' {\r\n');
                    this.outputTypescript.push(indentName + 'export module ' + item.name + ' {\r\n');
                    this.outputInterface.push(indentName + item.name + ': {\r\n');
                }
                var jsonOld = this.jsonNewValue(item.name);
                var results = this.scan(item.value);
                for (var _a = 0, _b = results.dataItems; _a < _b.length; _a++) {
                    var item2 = _b[_a];
                    this.outputDefinition.push(indentValue + 'const ' + item2.name + ': string;\r\n');
                    this.outputTypescript.push(indentValue + 'export const ' + item2.name + ' = \'' + item2.value + '\';\r\n');
                    this.outputInterface.push(indentValue + item2.name + ': string;\r\n');
                    this.jsonAddValue(item2.name, item2.value);
                }
                this.traverse(results.keyItems, ++indent);
                this.jsonCurrent = jsonOld;
                this.outputDefinition.push(indentName + '}\r\n');
                this.outputTypescript.push(indentName + '}\r\n');
                this.outputInterface.push(indentName + '};\r\n');
            }
        }
    };
    return ResJsonConverter;
}());
ResJsonConverter.openContent = "/* tslint:disable */\n/**\n * @file Source code generated by gulp-resjson.\n * @version 1.0\n */\n";
ResJsonConverter.closeContent = "}\n";
exports.ResJsonConverter = ResJsonConverter;
