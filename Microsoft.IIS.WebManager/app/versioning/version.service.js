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
var http_1 = require("@angular/http");
var angulartics2_ga_1 = require("angulartics2/src/providers/angulartics2-ga");
require("rxjs/add/operator/toPromise");
var httpclient_1 = require("../common/httpclient");
var connect_service_1 = require("../connect/connect.service");
var notification_service_1 = require("../notification/notification.service");
var notification_1 = require("../notification/notification");
var IntervalObservable_1 = require("rxjs/observable/IntervalObservable");
require("rxjs/add/operator/first");
var VersionService = /** @class */ (function () {
    function VersionService(_http, _httpClient, _notificationService, _connectSvc, _analytics) {
        this._http = _http;
        this._httpClient = _httpClient;
        this._notificationService = _notificationService;
        this._connectSvc = _connectSvc;
        this._analytics = _analytics;
        this.initialize();
    }
    VersionService.prototype.initialize = function () {
        var _this = this;
        var startAfter = 30 * 1000; // 30 seconds
        var interval = 2 * 3600000; // 2 hours
        // Wait for an initial period then check the api version on an interval
        setTimeout(function () {
            if (_this.connected()) {
                _this.checkVersions();
            }
            IntervalObservable_1.IntervalObservable.create(interval).subscribe(function (_) {
                if (_this.connected()) {
                    _this.checkVersions();
                }
            });
        }, startAfter);
    };
    VersionService.prototype.checkVersions = function () {
        var _this = this;
        this.makeApiRequest().then(function (res) {
            var userApiVersion = _this.parseApiVersion(res);
            var latestApiVersion = SETTINGS.api_version;
            if (_this.compareVersions(userApiVersion, latestApiVersion) < 0 && !_this.notificationExists()) {
                _this._notificationService.notify({
                    type: notification_1.NotificationType.Information,
                    componentName: "NewVersionNotificationComponent",
                    module: "app/main/app.module#AppModule",
                    data: {
                        version: SETTINGS.api_setup_version
                    },
                    highPriority: true
                });
            }
            if (_this._analytics) {
                var properties = {
                    category: "API_Version",
                    action: "Using",
                    label: userApiVersion
                };
                _this._analytics.eventTrack("Using", properties);
            }
        });
    };
    VersionService.prototype.notificationExists = function () {
        var notifications;
        var sub = this._notificationService.notifications.first().subscribe(function (n) {
            notifications = n;
        });
        return !!notifications.find(function (n) {
            return n.componentName === "NewVersionNotificationComponent";
        });
    };
    VersionService.prototype.compareVersions = function (a, b) {
        var aParts = a.split('.');
        var bParts = b.split('.');
        if (aParts.length != bParts.length) {
            throw "Invalid version format.";
        }
        for (var i = 0; i < aParts.length; i++) {
            var aI = parseInt(aParts[i]);
            var bI = parseInt(bParts[i]);
            if (aI != bI) {
                return aI - bI;
            }
        }
        return 0;
    };
    VersionService.prototype.parseApiVersion = function (res) {
        var VERSION_PREFIX = "application/vnd.Microsoft.WebServer.Api.";
        var couldntGetVersion = "Could not get API version.";
        if (!res.headers.get("Content-Type")) {
            throw couldntGetVersion;
        }
        var apiContentType = res.headers.get("Content-Type");
        if (apiContentType.indexOf(VERSION_PREFIX) !== 0) {
            throw couldntGetVersion;
        }
        var part = apiContentType.substring(VERSION_PREFIX.length);
        var suffix = ".application/";
        if (part.indexOf(suffix) === -1) {
            throw couldntGetVersion;
        }
        // Version (e.g. 1.0.1)
        return part.substr(0, part.indexOf(suffix));
    };
    VersionService.prototype.makeApiRequest = function () {
        var opts = this._httpClient.getOptions(http_1.RequestMethod.Get, "/", null);
        return this._httpClient.request("/", opts);
    };
    VersionService.prototype.connected = function () {
        var connection = null;
        this._connectSvc.active.first().subscribe(function (c) {
            connection = c;
        });
        return connection != null;
    };
    VersionService = __decorate([
        core_1.Injectable(),
        __param(4, core_1.Optional()),
        __metadata("design:paramtypes", [http_1.Http,
            httpclient_1.HttpClient,
            notification_service_1.NotificationService,
            connect_service_1.ConnectService,
            angulartics2_ga_1.Angulartics2GoogleAnalytics])
    ], VersionService);
    return VersionService;
}());
exports.VersionService = VersionService;
//# sourceMappingURL=version.service.js.map