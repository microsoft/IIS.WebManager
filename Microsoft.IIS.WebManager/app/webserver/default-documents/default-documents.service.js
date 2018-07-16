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
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var BehaviorSubject_1 = require("rxjs/BehaviorSubject");
var diff_1 = require("../../utils/diff");
var status_1 = require("../../common/status");
var httpclient_1 = require("../../common/httpclient");
var api_error_1 = require("../../error/api-error");
var DefaultDocumentsService = /** @class */ (function () {
    function DefaultDocumentsService(_http, route) {
        this._http = _http;
        this._defaultDoc = new BehaviorSubject_1.BehaviorSubject(null);
        this._files = new BehaviorSubject_1.BehaviorSubject(null);
        this._status = status_1.Status.Unknown;
        this.defaultDocument = this._defaultDoc.asObservable();
        this._webserverScope = route.snapshot.parent.url[0].path.toLocaleLowerCase() == 'webserver';
    }
    Object.defineProperty(DefaultDocumentsService.prototype, "status", {
        get: function () {
            return this._status;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DefaultDocumentsService.prototype, "webserverScope", {
        get: function () {
            return this._webserverScope;
        },
        enumerable: true,
        configurable: true
    });
    DefaultDocumentsService.prototype.init = function (id) {
        this.reset();
        return this.load(id);
    };
    DefaultDocumentsService.prototype.update = function (data) {
        var _this = this;
        return this._http.patch(this._defaultDoc.getValue()._links.self.href.replace("/api", ""), JSON.stringify(data))
            .then(function (obj) {
            return diff_1.DiffUtil.set(_this._defaultDoc.getValue(), obj);
        });
    };
    DefaultDocumentsService.prototype.revert = function () {
        var _this = this;
        return this._http.delete(this._defaultDoc.getValue()._links.self.href.replace("/api", ""))
            .then(function (_) {
            var id = _this._defaultDoc.getValue().id;
            _this._defaultDoc.getValue().id = undefined;
            return _this.load(id).then(function (_) {
                //
                // Update files
                if (_this._files.getValue()) {
                    _this.getFiles();
                }
                return _this._defaultDoc.getValue();
            });
        });
    };
    DefaultDocumentsService.prototype.install = function () {
        var _this = this;
        this._status = status_1.Status.Starting;
        return this._http.post("/webserver/default-documents/", "")
            .then(function (doc) {
            _this._status = status_1.Status.Started;
            _this._defaultDoc.next(doc);
        })
            .catch(function (e) {
            _this.error = e;
            throw e;
        });
    };
    DefaultDocumentsService.prototype.uninstall = function () {
        var _this = this;
        this._status = status_1.Status.Stopping;
        var id = this._defaultDoc.getValue().id;
        this._defaultDoc.next(null);
        return this._http.delete("/webserver/default-documents/" + id)
            .then(function () {
            _this._status = status_1.Status.Stopped;
        })
            .catch(function (e) {
            _this.error = e;
            throw e;
        });
    };
    Object.defineProperty(DefaultDocumentsService.prototype, "files", {
        //
        // Files
        // 
        get: function () {
            if (!this._files.getValue()) {
                this.getFiles();
            }
            return this._files.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    DefaultDocumentsService.prototype.addFile = function (file) {
        var _this = this;
        file.default_document = { id: this._defaultDoc.getValue().id };
        return this._http.post(this._defaultDoc.getValue()._links.files.href.replace("/api", ""), JSON.stringify(file))
            .then(function (f) {
            diff_1.DiffUtil.set(file, _this.fileFromJson(f));
            var files = _this._files.getValue() || [];
            files.splice(0, 0, file);
            _this._files.next(files);
            _this._defaultDoc.getValue().metadata.is_local = true;
            return file;
        });
    };
    DefaultDocumentsService.prototype.updateFile = function (file, data) {
        var _this = this;
        return this._http.patch(file._links.self.href.replace("/api", ""), JSON.stringify(data))
            .then(function (f) {
            _this._defaultDoc.getValue().metadata.is_local = true;
            return diff_1.DiffUtil.set(file, _this.fileFromJson(f));
        });
    };
    DefaultDocumentsService.prototype.deleteFile = function (file) {
        var _this = this;
        return this._http.delete(file._links.self.href.replace("/api", ""))
            .then(function (_) {
            var files = _this._files.getValue() || [];
            var i = files.indexOf(file);
            if (i >= 0) {
                files.splice(i, 1);
            }
            file.id = file._links = undefined;
            _this._defaultDoc.getValue().metadata.is_local = true;
            _this._files.next(files);
        });
    };
    DefaultDocumentsService.prototype.fileFromJson = function (obj) {
        obj.default_document = this._defaultDoc.getValue();
        return obj;
    };
    DefaultDocumentsService.prototype.load = function (id) {
        var _this = this;
        return this._http.get("/webserver/default-documents/" + id)
            .then(function (obj) {
            _this._status = status_1.Status.Started;
            _this._defaultDoc.next(obj);
            return obj;
        })
            .catch(function (e) {
            _this.error = e;
            if (e.type && e.type == api_error_1.ApiErrorType.FeatureNotInstalled) {
                _this._status = status_1.Status.Stopped;
            }
            throw e;
        });
    };
    DefaultDocumentsService.prototype.getFiles = function () {
        var _this = this;
        return this._http.get(this._defaultDoc.getValue()._links.files.href.replace("/api", ""))
            .then(function (obj) {
            _this._files.next(obj.files.map(function (f) { return _this.fileFromJson(f); }));
            return _this._files.getValue();
        });
    };
    DefaultDocumentsService.prototype.reset = function () {
        this.error = null;
        this._defaultDoc.next(null);
        this._files.next(null);
    };
    DefaultDocumentsService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [httpclient_1.HttpClient, router_1.ActivatedRoute])
    ], DefaultDocumentsService);
    return DefaultDocumentsService;
}());
exports.DefaultDocumentsService = DefaultDocumentsService;
//# sourceMappingURL=default-documents.service.js.map