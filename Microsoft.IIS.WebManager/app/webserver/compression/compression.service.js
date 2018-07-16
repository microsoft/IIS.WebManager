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
var CompressionService = /** @class */ (function () {
    function CompressionService(_http, route) {
        this._http = _http;
        this._status = status_1.Status.Unknown;
        this._compression = new BehaviorSubject_1.BehaviorSubject(null);
        this._webserverScope = route.snapshot.parent.url[0].path.toLocaleLowerCase() == 'webserver';
    }
    CompressionService_1 = CompressionService;
    Object.defineProperty(CompressionService.prototype, "status", {
        get: function () {
            return this._status;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CompressionService.prototype, "webserverScope", {
        get: function () {
            return this._webserverScope;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CompressionService.prototype, "compression", {
        get: function () {
            return this._compression.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    CompressionService.prototype.initialize = function (id) {
        var _this = this;
        return this._http.get(CompressionService_1.URL + id)
            .then(function (compression) {
            _this._status = status_1.Status.Started;
            _this._compression.next(compression);
        })
            .catch(function (e) {
            _this.error = e;
            if (e.type && e.type == api_error_1.ApiErrorType.FeatureNotInstalled) {
                _this._status = status_1.Status.Stopped;
            }
            throw e;
        });
    };
    CompressionService.prototype.update = function (data) {
        var _this = this;
        var id = this._compression.getValue().id;
        return this._http.patch(CompressionService_1.URL + id, JSON.stringify(data))
            .then(function (feature) {
            var comp = _this._compression.getValue();
            diff_1.DiffUtil.set(comp, feature);
            _this._compression.next(comp);
        });
    };
    CompressionService.prototype.revert = function () {
        var _this = this;
        var id = this._compression.getValue().id;
        return this._http.delete(CompressionService_1.URL + id)
            .then(function () { return _this.initialize(id); });
    };
    CompressionService.prototype.install = function () {
        var _this = this;
        this._status = status_1.Status.Starting;
        return this._http.post(CompressionService_1.URL, "")
            .then(function (doc) {
            _this._status = status_1.Status.Started;
            _this._compression.next(doc);
        })
            .catch(function (e) {
            _this.error = e;
            throw e;
        });
    };
    CompressionService.prototype.uninstall = function () {
        var _this = this;
        this._status = status_1.Status.Stopping;
        var id = this._compression.getValue().id;
        this._compression.next(null);
        return this._http.delete(CompressionService_1.URL + id)
            .then(function () {
            _this._status = status_1.Status.Stopped;
        })
            .catch(function (e) {
            _this.error = e;
            throw e;
        });
    };
    CompressionService.URL = "/webserver/http-response-compression/";
    CompressionService = CompressionService_1 = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [httpclient_1.HttpClient, router_1.ActivatedRoute])
    ], CompressionService);
    return CompressionService;
    var CompressionService_1;
}());
exports.CompressionService = CompressionService;
//# sourceMappingURL=compression.service.js.map