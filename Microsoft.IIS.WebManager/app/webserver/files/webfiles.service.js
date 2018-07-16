"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var common_1 = require("@angular/common");
var BehaviorSubject_1 = require("rxjs/BehaviorSubject");
require("rxjs/add/operator/toPromise");
require("rxjs/add/operator/startwith");
require("rxjs/add/operator/pairwise");
require("rxjs/add/operator/first");
var httpclient_1 = require("../../common/httpclient");
var notification_service_1 = require("../../notification/notification.service");
var files_service_1 = require("../../files/files.service");
var file_1 = require("../../files/file");
var webfile_1 = require("./webfile");
var location_hash_1 = require("../../common/location-hash");
var WebFilesService = /** @class */ (function () {
    function WebFilesService(_http, _svc, _notificationService, location, route) {
        var _this = this;
        this._http = _http;
        this._svc = _svc;
        this._notificationService = _notificationService;
        this._fileInfoFields = "file_info.name,file_info.alias,file_info.type,file_info.physical_path,file_info.size,created,file_info.last_modified,file_info.mime_type,file_info.e_tag,file_info.parent";
        this._current = new BehaviorSubject_1.BehaviorSubject(null);
        this._files = new BehaviorSubject_1.BehaviorSubject([]);
        this._subscriptions = [];
        this._hashWatcher = new location_hash_1.LocationHash(route, location);
        //
        // File system changes
        this._subscriptions.push(_svc.change.subscribe(function (e) {
            var dir = _this._current.getValue();
            if (!dir || (e.target.parent.id != dir.file_info.id)) {
                return;
            }
            var files = _this._files.getValue();
            // Create
            if (e.type == file_1.ChangeType.Created) {
                _this.getFile(dir.path + "/" + e.target.name).then(function (f) {
                    files.unshift(f);
                    _this._files.next(files);
                });
                return;
            }
            // Delete
            if (e.type == file_1.ChangeType.Deleted) {
                var i = files.findIndex(function (f) { return f.file_info.id == e.target.id; });
                if (i >= 0) {
                    files.splice(i, 1);
                    _this._files.next(files);
                }
                ;
                return;
            }
            // Update
            if (e.type == file_1.ChangeType.Updated) {
                var file_2 = files.find(function (f) { return f.file_info.id == e.target.id; });
                if (file_2) {
                    _this.getFile(dir.path + "/" + e.target.name).then(function (f) { return Object.assign(file_2, f); });
                }
                return;
            }
        }));
    }
    WebFilesService.prototype.dispose = function () {
        this._subscriptions.forEach(function (s) { return s.unsubscribe(); });
        if (this._hashWatcher != null) {
            this._hashWatcher.dispose();
            this._hashWatcher = null;
        }
    };
    WebFilesService.prototype.init = function (site) {
        var _this = this;
        if (!(site && site.id)) {
            throw Error("Invalid WebSite");
        }
        this._website = site;
        //
        // Hash Navigation
        this._subscriptions.push(this._hashWatcher.hash.startWith(null).pairwise().subscribe(function (pair) {
            var previous = pair[0];
            var hash = pair[1];
            _this.loadDir(hash || '/');
        }));
    };
    Object.defineProperty(WebFilesService.prototype, "current", {
        get: function () {
            return this._current.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WebFilesService.prototype, "files", {
        get: function () {
            return this._files.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    WebFilesService.prototype.load = function (path) {
        var cur = this._current.getValue();
        if (this._hashWatcher.getHash || (cur && cur.path != path)) {
            this._hashWatcher.setHash(path);
        }
        else {
            this.loadDir(path || '/');
        }
    };
    WebFilesService.prototype.create = function (file) {
        file.file_info.type = this.isDir(file) ? file_1.ApiFileType.Directory : file_1.ApiFileType.File;
        file.file_info.name = file.name;
        this._svc.create(file.file_info, file.parent.file_info);
    };
    WebFilesService.prototype.delete = function (files) {
        // file_info can be null if the child physical path is forbidden
        var filtered = this.removeChildrenWithoutInfo(files);
        return this._svc.delete(filtered.map(function (f) { return f.file_info; }));
    };
    WebFilesService.prototype.rename = function (file, name) {
        if (!file.file_info) {
            this._notificationService.warn("'" + file.path + "' could not be renamed");
        }
        if (name) {
            this._notificationService.clearWarnings();
            var oldName_1 = file.name;
            file.name = name;
            this._svc.update(file.file_info, { name: name }).catch(function (e) {
                file.name = oldName_1;
                throw e;
            });
        }
    };
    WebFilesService.prototype.upload = function (files, destination) {
        this._svc.upload(destination.file_info, files);
    };
    WebFilesService.prototype.copy = function (sources, to, name) {
        var filtered = this.removeChildrenWithoutInfo(sources);
        this._svc.copy(sources.map(function (s) { return (s.file_info || s); }), to.file_info, name);
    };
    WebFilesService.prototype.move = function (sources, to, name) {
        var filtered = this.removeChildrenWithoutInfo(sources);
        this._svc.move(filtered.map(function (s) { return (s.file_info || s); }), to.file_info, name);
    };
    WebFilesService.prototype.drag = function (e, files) {
        this._svc.drag(e, files);
    };
    WebFilesService.prototype.drop = function (e, destination) {
        var _this = this;
        var apiFiles = this._svc.getDraggedFiles(e);
        var items = e.dataTransfer.items;
        var files = e.dataTransfer.files;
        var copy = (e.dataTransfer.effectAllowed == "all") || ((e.dataTransfer.effectAllowed.toLowerCase() == "copymove") && e.ctrlKey);
        var promise = (destination instanceof webfile_1.WebFile) ? Promise.resolve(destination) : this.getFile(destination);
        promise.then(function (dir) {
            //
            // Copy/Move File(s)
            if (apiFiles.length > 0) {
                apiFiles = apiFiles.filter(function (f) { return f; });
                copy ? _this._svc.copy(apiFiles, dir.file_info) : _this._svc.move(apiFiles, dir.file_info);
                return;
            }
            //
            // Upload items
            if (items && items.length > 0) {
                _this._svc.uploadItems(items, dir.file_info);
                return;
            }
            //
            // Upload local File(s)
            if (files && files.length > 0) {
                _this.upload(files, dir);
                return;
            }
        });
    };
    WebFilesService.prototype.getDraggedFiles = function (e) {
        return this._svc.getDraggedFiles(e);
    };
    WebFilesService.prototype.clipboardPaste = function (e, destination) {
        this._svc.clipboardPaste(e, destination.file_info);
    };
    WebFilesService.prototype.clipboardCopy = function (e, files) {
        files = files.filter(function (f) { return f.file_info; });
        this._svc.clipboardCopy(e, files.map(function (f) { return f.file_info; }));
    };
    WebFilesService.prototype.loadDir = function (path) {
        var _this = this;
        if (!this._website) {
            Promise.reject("WebSite is not specified");
        }
        this._notificationService.clearWarnings();
        // Get dir
        return this.getFile(path)
            .then(function (dir) {
            _this._current.next(webfile_1.WebFile.fromObj(dir));
            if (_this.isDir(dir)) {
                _this.loadFiles();
            }
            return _this._current.getValue();
        })
            .catch(function (e) {
            _this._current.next(null);
            // Clear files
            _this._files.getValue().splice(0);
            _this._files.next(_this._files.getValue());
            _this._svc.handleError(e, path);
            throw e;
        });
    };
    WebFilesService.prototype.loadFiles = function () {
        var _this = this;
        var dir = this._current.getValue();
        var files = this._files.getValue();
        this._http.get("/webserver/files?parent.id=" + dir.id + "&fields=name,type,path," + this._fileInfoFields)
            .then(function (res) {
            res = (res.files).map(function (f) { return webfile_1.WebFile.fromObj(f); });
            files.splice(0); // Clear
            res.forEach(function (f) { return files.push(f); });
            _this._files.next(files);
        });
    };
    WebFilesService.prototype.getFile = function (path) {
        path = path.replace("//", "/");
        return this._http.get("/webserver/files?website.id=" + this._website.id + "&path=" + encodeURIComponent(path) + "&fields=name,type,path," + this._fileInfoFields, null, false)
            .then(function (f) { return webfile_1.WebFile.fromObj(f); });
    };
    WebFilesService.prototype.isDir = function (file) {
        return file.type == webfile_1.WebFileType.Directory || file.type == webfile_1.WebFileType.Vdir || file.type == webfile_1.WebFileType.Application;
    };
    WebFilesService.prototype.removeChildrenWithoutInfo = function (files) {
        var removed = "";
        var filtered = files.filter(function (f) {
            if (!f.file_info) {
                removed += !!removed ? ", " : "";
                removed += "'" + f.path + "'";
            }
            return f.file_info;
        });
        if (removed) {
            var warning = "Forbidden: " + removed;
            this._notificationService.warn(warning);
        }
        return filtered;
    };
    WebFilesService = __decorate([
        core_1.Injectable(),
        __param(1, core_1.Inject("FilesService")),
        __metadata("design:paramtypes", [httpclient_1.HttpClient,
            files_service_1.FilesService,
            notification_service_1.NotificationService,
            common_1.Location,
            router_1.ActivatedRoute])
    ], WebFilesService);
    return WebFilesService;
}());
exports.WebFilesService = WebFilesService;
//# sourceMappingURL=webfiles.service.js.map