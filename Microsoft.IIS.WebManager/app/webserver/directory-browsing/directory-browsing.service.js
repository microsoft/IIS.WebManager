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
var DirectoryBrowsingService = /** @class */ (function () {
    function DirectoryBrowsingService(_http, route) {
        this._http = _http;
        this._status = status_1.Status.Unknown;
        this._directoryBrowsing = new BehaviorSubject_1.BehaviorSubject(null);
        this._webserverScope = route.snapshot.parent.url[0].path.toLocaleLowerCase() == 'webserver';
    }
    DirectoryBrowsingService_1 = DirectoryBrowsingService;
    Object.defineProperty(DirectoryBrowsingService.prototype, "status", {
        get: function () {
            return this._status;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DirectoryBrowsingService.prototype, "webserverScope", {
        get: function () {
            return this._webserverScope;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DirectoryBrowsingService.prototype, "directoryBrowsing", {
        get: function () {
            return this._directoryBrowsing.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    DirectoryBrowsingService.prototype.init = function (id) {
        var _this = this;
        return this._http.get(DirectoryBrowsingService_1.URL + id)
            .then(function (feature) {
            _this._status = status_1.Status.Started;
            _this._directoryBrowsing.next(feature);
        })
            .catch(function (e) {
            _this.error = e;
            if (e.type && e.type == api_error_1.ApiErrorType.FeatureNotInstalled) {
                _this._status = status_1.Status.Stopped;
            }
        });
    };
    DirectoryBrowsingService.prototype.update = function (data) {
        var _this = this;
        var id = this._directoryBrowsing.getValue().id;
        return this._http.patch(DirectoryBrowsingService_1.URL + id, JSON.stringify(data))
            .then(function (feature) {
            var d = _this._directoryBrowsing.getValue();
            diff_1.DiffUtil.set(d, feature);
            _this._directoryBrowsing.next(d);
        });
    };
    DirectoryBrowsingService.prototype.revert = function () {
        var _this = this;
        var id = this._directoryBrowsing.getValue().id;
        return this._http.delete(DirectoryBrowsingService_1.URL + id)
            .then(function () { return _this.init(id); });
    };
    DirectoryBrowsingService.prototype.install = function () {
        var _this = this;
        this._status = status_1.Status.Starting;
        return this._http.post(DirectoryBrowsingService_1.URL, "")
            .then(function (doc) {
            _this._status = status_1.Status.Started;
            _this._directoryBrowsing.next(doc);
        })
            .catch(function (e) {
            _this.error = e;
            throw e;
        });
    };
    DirectoryBrowsingService.prototype.uninstall = function () {
        var _this = this;
        this._status = status_1.Status.Stopping;
        var id = this._directoryBrowsing.getValue().id;
        this._directoryBrowsing.next(null);
        return this._http.delete(DirectoryBrowsingService_1.URL + id)
            .then(function () {
            _this._status = status_1.Status.Stopped;
        })
            .catch(function (e) {
            _this.error = e;
            throw e;
        });
    };
    DirectoryBrowsingService.URL = "/webserver/directory-browsing/";
    DirectoryBrowsingService = DirectoryBrowsingService_1 = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [httpclient_1.HttpClient, router_1.ActivatedRoute])
    ], DirectoryBrowsingService);
    return DirectoryBrowsingService;
    var DirectoryBrowsingService_1;
}());
exports.DirectoryBrowsingService = DirectoryBrowsingService;
//# sourceMappingURL=directory-browsing.service.js.map