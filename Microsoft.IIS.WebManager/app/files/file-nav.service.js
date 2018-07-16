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
require("rxjs/add/operator/pairwise");
require("rxjs/add/operator/startwith");
var BehaviorSubject_1 = require("rxjs/BehaviorSubject");
var notification_service_1 = require("../notification/notification.service");
var string_1 = require("../utils/string");
var file_1 = require("./file");
var navigator_1 = require("./navigator");
var files_service_1 = require("./files.service");
var Root = file_1.ApiFile.fromObj({
    physical_path: "",
    type: file_1.ApiFileType.Directory
});
var FileNavService = /** @class */ (function () {
    function FileNavService(_svc, _notificationService, _location, _route) {
        var _this = this;
        this._svc = _svc;
        this._notificationService = _notificationService;
        this._location = _location;
        this._route = _route;
        this._roots = null;
        this._defaultPath = null;
        this._subscriptions = [];
        this._current = new BehaviorSubject_1.BehaviorSubject(null);
        this._files = new BehaviorSubject_1.BehaviorSubject([]);
        //
        // File system changes
        this._subscriptions.push(_svc.change.subscribe(function (e) {
            var dir = _this._current.getValue();
            if (!dir || (!e.target.isLocation && e.target.parent != null && !file_1.ApiFile.equal(e.target.parent, dir))) {
                return;
            }
            var files = _this._files.getValue();
            // Create
            if (e.type == file_1.ChangeType.Created) {
                _this._svc.getByPhysicalPath(e.target.physical_path).then(function (f) {
                    Object.assign(e.target, f);
                    files.unshift(e.target);
                    _this._files.next(files);
                });
                //
                // Location
                if (e.target.isLocation) {
                    _this._roots.unshift(e.target);
                }
                return;
            }
            // Delete
            if (e.type == file_1.ChangeType.Deleted) {
                var i = files.findIndex(function (f) { return f.id == e.target.id; });
                if (i >= 0) {
                    files.splice(i, 1);
                    _this._files.next(files);
                }
                ;
                //
                // Location
                if (e.target.isLocation) {
                    var i_1 = _this._roots.findIndex(function (f) { return f.id == e.target.id; });
                    if (i_1 >= 0) {
                        _this._roots.splice(i_1, 1);
                    }
                    ;
                }
                return;
            }
            // Update
            if (e.type == file_1.ChangeType.Updated) {
                var file_2 = files.find(function (f) { return f.id == e.target.id; });
                if (file_2) {
                    _this._svc.getByPhysicalPath(e.target.physical_path).then(function (f) { return Object.assign(file_2, f); });
                }
                return;
            }
        }));
    }
    Object.defineProperty(FileNavService.prototype, "current", {
        get: function () {
            return this._current.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FileNavService.prototype, "files", {
        get: function () {
            return this._files.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    FileNavService.prototype.dispose = function () {
        for (var _i = 0, _a = this._subscriptions; _i < _a.length; _i++) {
            var sub = _a[_i];
            sub.unsubscribe();
        }
        if (this._nav != null) {
            this._nav.dispose();
            this._nav = null;
        }
    };
    FileNavService.prototype.init = function (useHash, defaultPath) {
        var _this = this;
        if (defaultPath === void 0) { defaultPath = null; }
        //
        // Navigation
        this._defaultPath = defaultPath;
        this._nav = new navigator_1.Navigator(this._route, this._location, useHash, defaultPath);
        this._subscriptions.push(this._nav.path.startWith(null).pairwise().subscribe(function (pair) {
            var previous = pair[0];
            var hash = pair[1];
            _this.loadDir(hash);
        }));
    };
    FileNavService.prototype.load = function (path) {
        var cur = this._current.getValue();
        path = this.toAlias(this.startFromVolume(path));
        if (this._nav.getPath() || (cur && this.normalize(cur.physical_path) != this.normalize(path))) {
            this._nav.setPath(path);
        }
        else {
            this.loadDir(path);
        }
    };
    FileNavService.prototype.toAlias = function (path) {
        var _this = this;
        if (!path) {
            return path;
        }
        //
        // Given current navigation context, get aliased path for the provided physical path
        path = path.replace(/\\/g, '/');
        var cur = !this._roots ? null : this._roots.find(function (r) { return _this.normalize(path).startsWith(_this.normalize(r.physical_path)); });
        if (cur) {
            var suffix = path.substr(cur.physical_path.length, path.length - cur.physical_path.length);
            var start = (cur.alias || cur.name).replace(/\\/g, '/');
            if (!suffix.startsWith('/') && !start.endsWith('/')) {
                suffix = '/' + suffix;
            }
            path = start + suffix;
        }
        else {
            // Handle obtaining alias from the virtual root directory
            var root = this._files.getValue().find(function (f) { return _this.normalize(f.physical_path) == _this.normalize(path); });
            if (root) {
                path = root.alias || root.name;
            }
        }
        return path;
    };
    FileNavService.prototype.fromAlias = function (path) {
        var _this = this;
        var roots = this._roots ? Promise.resolve(this._roots) : this._svc.getRoots().then(function (roots) { return _this._roots = roots; });
        return roots
            .then(function (res) {
            //
            // Don't de-alias UNC paths "//"
            if (!path.startsWith('//')) {
                var parts = path.split('/').filter(function (p) { return !!p; });
                var start_1 = parts[0];
                var suffix = '/' + parts.splice(1, parts.length - 1).join('/');
                var root = res.find(function (r) { return r.alias && r.alias.toLocaleLowerCase() == start_1.toLocaleLowerCase(); });
                //
                // Fall back to root folder name
                if (!root) {
                    root = res.find(function (r) { return string_1.StringUtil.trimRight(r.name, ['/', '\\']).toLocaleLowerCase() == start_1.toLocaleLowerCase(); });
                }
                path = !root ? path : root.physical_path + suffix;
            }
            return path;
        });
    };
    FileNavService.prototype.loadDir = function (path) {
        var _this = this;
        this._notificationService.clearWarnings();
        if (!path || path.endsWith(":")) {
            path = (path || "") + "/";
        }
        // Get dir
        return (path == "/" ? Promise.resolve(Root) : this.get(path))
            .catch(function (e) {
            //
            // Load root directory if initial path doesn't exist
            throw e;
        })
            .then(function (dir) {
            _this._current.next(file_1.ApiFile.fromObj(dir));
            if (dir.type == file_1.ApiFileType.Directory) {
                _this.loadFiles();
            }
            return _this._current.getValue();
        })
            .catch(function (e) {
            _this._current.next(null);
            // Clear files
            _this._files.getValue().splice(0);
            _this._files.next(_this._files.getValue());
            if (_this._defaultPath && path == _this._defaultPath) {
                _this.load("/");
                return;
            }
            _this.handleError(e, path);
            throw e;
        });
    };
    FileNavService.prototype.loadFiles = function () {
        var _this = this;
        var dir = this._current.getValue();
        var files = this._files.getValue();
        (!dir.physical_path ? this._svc.getRoots().then(function (roots) { return _this._roots = roots; }) : this._svc.getChildren(dir))
            .then(function (fs) {
            //
            // Make sure the files returned are for the directory we are in
            if (_this._current.getValue() != dir) {
                return;
            }
            files.splice(0); // Clear
            fs.forEach(function (f) { return files.push(f); });
            _this._files.next(files);
        });
    };
    FileNavService.prototype.get = function (path) {
        var _this = this;
        return this.fromAlias(path)
            .then(function (p) {
            return _this._svc.getByPhysicalPath(p)
                .then(function (res) {
                return file_1.ApiFile.fromObj(res);
            });
        });
    };
    FileNavService.prototype.normalize = function (path) {
        return !path ? "" : path.toLocaleLowerCase().replace(/\\/g, '/');
    };
    FileNavService.prototype.startFromVolume = function (path) {
        var parts = path.replace(/\\/g, '/').split('/');
        for (var i = parts.length - 1; i >= 0; i--) {
            if (parts[i].indexOf(':') != -1) {
                parts.splice(0, i);
                break;
            }
        }
        return parts.join('/');
    };
    FileNavService.prototype.handleError = function (e, path) {
        if (path === void 0) { path = null; }
        this._svc.handleError(e, path);
    };
    FileNavService = __decorate([
        core_1.Injectable(),
        __param(0, core_1.Inject("FilesService")),
        __metadata("design:paramtypes", [files_service_1.FilesService,
            notification_service_1.NotificationService,
            common_1.Location,
            router_1.ActivatedRoute])
    ], FileNavService);
    return FileNavService;
}());
exports.FileNavService = FileNavService;
//# sourceMappingURL=file-nav.service.js.map