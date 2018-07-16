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
var BehaviorSubject_1 = require("rxjs/BehaviorSubject");
var diff_1 = require("../../utils/diff");
var status_1 = require("../../common/status");
var api_error_1 = require("../../error/api-error");
var httpclient_1 = require("../../common/httpclient");
var notification_service_1 = require("../../notification/notification.service");
var CentralCertificateService = /** @class */ (function () {
    function CentralCertificateService(_http, _notificationService) {
        this._http = _http;
        this._notificationService = _notificationService;
        this._configuration = new BehaviorSubject_1.BehaviorSubject(null);
        this._enabled = new BehaviorSubject_1.BehaviorSubject(false);
        this._status = status_1.Status.Unknown;
    }
    CentralCertificateService_1 = CentralCertificateService;
    Object.defineProperty(CentralCertificateService.prototype, "configuration", {
        get: function () {
            return this._configuration.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CentralCertificateService.prototype, "enabled", {
        get: function () {
            return this._enabled.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CentralCertificateService.prototype, "status", {
        get: function () {
            return this._status;
        },
        enumerable: true,
        configurable: true
    });
    CentralCertificateService.prototype.initialize = function (id) {
        var _this = this;
        return this._http.get(CentralCertificateService_1.URL + id)
            .then(function (obj) {
            _this._enabled.next(true);
            _this._status = status_1.Status.Started;
            _this._configuration.next(obj);
            return obj;
        })
            .catch(function (e) {
            if (e.type && e.type == api_error_1.ApiErrorType.FeatureNotInstalled) {
                _this._enabled.next(false);
                _this._status = status_1.Status.Stopped;
                return;
            }
            throw e;
        });
    };
    CentralCertificateService.prototype.update = function (data) {
        var _this = this;
        return this._http.patch(this._configuration.getValue()._links.self.href.replace("/api", ""), JSON.stringify(data))
            .then(function (obj) {
            diff_1.DiffUtil.set(_this._configuration.getValue(), obj);
            _this._configuration.next(_this._configuration.getValue());
        })
            .catch(function (e) {
            _this.onError(e);
            throw e;
        });
    };
    CentralCertificateService.prototype.enable = function (data) {
        var _this = this;
        this._status = status_1.Status.Starting;
        return this._http.post(CentralCertificateService_1.URL, JSON.stringify(data))
            .then(function (obj) {
            _this._enabled.next(true);
            _this._status = status_1.Status.Started;
            _this._configuration.next(obj);
        })
            .catch(function (e) {
            _this._status = status_1.Status.Unknown;
            _this.onError(e);
            throw e;
        });
    };
    CentralCertificateService.prototype.disable = function () {
        var _this = this;
        this._status = status_1.Status.Stopping;
        return this._http.delete(CentralCertificateService_1.URL + this._configuration.getValue().id)
            .then(function () {
            _this._configuration.next(null);
            _this._enabled.next(false);
            _this._status = status_1.Status.Stopped;
        })
            .catch(function (e) {
            _this._status = status_1.Status.Unknown;
            throw e;
        });
    };
    CentralCertificateService.prototype.onError = function (e) {
        if (e.status && e.status == 400 && e.name == 'identity') {
            this._notificationService.warn("Unable to connect to the central certificate store using the given credentials");
        }
        else if (e.status && e.status == 403 && e.name == 'physical_path') {
            this._notificationService.warn("Access to the specified physical path is not allowed");
        }
        else if (e.status && e.status == 404 && e.name == 'physical_path') {
            this._notificationService.warn("The specified directory could not be found");
        }
    };
    CentralCertificateService.URL = "/webserver/centralized-certificates/";
    CentralCertificateService = CentralCertificateService_1 = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [httpclient_1.HttpClient, notification_service_1.NotificationService])
    ], CentralCertificateService);
    return CentralCertificateService;
    var CentralCertificateService_1;
}());
exports.CentralCertificateService = CentralCertificateService;
//# sourceMappingURL=central-certificate.service.js.map