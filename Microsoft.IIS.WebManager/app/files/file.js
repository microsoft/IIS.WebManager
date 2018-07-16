"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiFileType = {
    File: "file",
    Directory: "directory"
};
var ApiFile = /** @class */ (function () {
    function ApiFile() {
    }
    ApiFile.fromObj = function (obj) {
        if (!obj) {
            return null;
        }
        var f = new ApiFile();
        Object.assign(f, obj);
        f.created = obj.created ? new Date(obj.created) : null;
        f.last_modified = obj.last_modified ? new Date(obj.last_modified) : null;
        if (f.parent) {
            f.parent = ApiFile.fromObj(f.parent);
        }
        return f;
    };
    Object.defineProperty(ApiFile.prototype, "extension", {
        get: function () {
            if (this.type == exports.ApiFileType.File && this.name) {
                var segments = this.name.split('.');
                if (segments.length > 1) {
                    return segments.pop().toLocaleLowerCase();
                }
            }
            return "";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ApiFile.prototype, "description", {
        get: function () {
            switch (this.type) {
                case exports.ApiFileType.Directory:
                    return "File Folder";
                case exports.ApiFileType.File:
                    var ext = this.extension.toLocaleUpperCase();
                    return ext ? (ext + " File") : "";
            }
            return "";
        },
        enumerable: true,
        configurable: true
    });
    ApiFile.isDir = function (file) {
        return file && file.type == exports.ApiFileType.Directory;
    };
    ApiFile.equal = function (a, b) {
        if (!a || !b) {
            return false;
        }
        if (!a.physical_path || !b.physical_path) {
            return a.physical_path == b.physical_path;
        }
        return this.trimRight(a.physical_path.toLocaleLowerCase().replace(/\\/g, '/'), '/') == this.trimRight(b.physical_path.toLocaleLowerCase().replace(/\\/g, '/'), '/');
    };
    ApiFile.trimRight = function (from, target) {
        while (from.endsWith(target)) {
            from = from.substr(0, from.length - target.length);
        }
        return from;
    };
    return ApiFile;
}());
exports.ApiFile = ApiFile;
exports.MimeTypes = {
    ApiFiles: "application/files+json",
    Url: "URL",
    ClipboardOperation: "application/clipboard-op+json"
};
exports.ChangeType = {
    Created: "created",
    Deleted: "deleted",
    Updated: "updated"
};
var FileChangeEvent = /** @class */ (function () {
    function FileChangeEvent() {
    }
    FileChangeEvent.created = function (target) {
        var evt = new FileChangeEvent();
        evt.type = exports.ChangeType.Created;
        evt.target = target;
        return evt;
    };
    FileChangeEvent.updated = function (target) {
        var evt = new FileChangeEvent();
        evt.type = exports.ChangeType.Updated;
        evt.target = target;
        return evt;
    };
    FileChangeEvent.deleted = function (target) {
        var evt = new FileChangeEvent();
        evt.type = exports.ChangeType.Deleted;
        evt.target = target;
        return evt;
    };
    return FileChangeEvent;
}());
exports.FileChangeEvent = FileChangeEvent;
var ExplorerOptions = /** @class */ (function () {
    function ExplorerOptions(initalValue) {
        this.setAll(initalValue);
    }
    Object.defineProperty(ExplorerOptions, "AllEnabled", {
        get: function () {
            return this._allEnabled;
        },
        enumerable: true,
        configurable: true
    });
    ExplorerOptions.prototype.setAll = function (val) {
        this.EnableRefresh = val;
        this.EnableNewFile = val;
        this.EnableNewFolder = val;
        this.EnableUpload = val;
        this.EnableDelete = val;
    };
    ExplorerOptions._allEnabled = new ExplorerOptions(true);
    return ExplorerOptions;
}());
exports.ExplorerOptions = ExplorerOptions;
//# sourceMappingURL=file.js.map