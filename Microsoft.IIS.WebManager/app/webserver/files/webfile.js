"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var file_1 = require("../../files/file");
exports.WebFileType = {
    Application: "application",
    File: "file",
    Directory: "directory",
    Vdir: "vdir"
};
var WebFile = /** @class */ (function () {
    function WebFile() {
        this.file_info = new file_1.ApiFile();
    }
    WebFile.clone = function (f) {
        return WebFile.fromObj(JSON.parse(JSON.stringify(f)));
    };
    WebFile.fromObj = function (obj) {
        if (!obj) {
            return null;
        }
        var f = new WebFile();
        Object.assign(f, obj);
        if (f.file_info) {
            f.file_info = file_1.ApiFile.fromObj(obj.file_info);
        }
        return f;
    };
    Object.defineProperty(WebFile.prototype, "description", {
        get: function () {
            switch (this.type) {
                case exports.WebFileType.Application:
                    return "Web Application";
                case exports.WebFileType.Vdir:
                    return "Virtual Directory";
                default:
                    return !this.file_info ? "" : this.file_info.description;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WebFile.prototype, "isVirtual", {
        get: function () {
            return this.type == exports.WebFileType.Application || this.type == exports.WebFileType.Vdir;
        },
        enumerable: true,
        configurable: true
    });
    WebFile.isDir = function (file) {
        return file && (file.type == exports.WebFileType.Directory || file.type == exports.WebFileType.Vdir || file.type == exports.WebFileType.Application);
    };
    return WebFile;
}());
exports.WebFile = WebFile;
//# sourceMappingURL=webfile.js.map