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
var BehaviorSubject_1 = require("rxjs/BehaviorSubject");
var status_1 = require("../../common/status");
var httpclient_1 = require("../../common/httpclient");
var file_1 = require("../../files/file");
var files_service_1 = require("../../files/files.service");
var api_error_1 = require("../../error/api-error");
var websites_service_1 = require("../websites/websites.service");
var notification_service_1 = require("../../notification/notification.service");
var LoggingService = /** @class */ (function () {
    function LoggingService(_http, route, _notifications, _filesService, _webSitesService) {
        var _this = this;
        this._http = _http;
        this._notifications = _notifications;
        this._filesService = _filesService;
        this._webSitesService = _webSitesService;
        this._status = status_1.Status.Unknown;
        this._subscriptions = [];
        this._logging = new BehaviorSubject_1.BehaviorSubject(null);
        this._logs = new BehaviorSubject_1.BehaviorSubject([]);
        this._webserverScope = route.snapshot.parent.url[0].path.toLocaleLowerCase() == 'webserver';
        this._subscriptions.push(this._filesService.change.subscribe(function (evt) {
            if (evt.type == file_1.ChangeType.Deleted) {
                _this._logs.next(_this._logs.getValue().filter(function (log) { return log.id != evt.target.id; }));
            }
        }));
    }
    LoggingService_1 = LoggingService;
    Object.defineProperty(LoggingService.prototype, "status", {
        get: function () {
            return this._status;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LoggingService.prototype, "webserverScope", {
        get: function () {
            return this._webserverScope;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LoggingService.prototype, "logging", {
        get: function () {
            return this._logging.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    LoggingService.prototype.dispose = function () {
        this._subscriptions.forEach(function (sub) { return sub.unsubscribe(); });
    };
    LoggingService.prototype.initialize = function (id) {
        this.load(id);
    };
    LoggingService.prototype.update = function (data) {
        var _this = this;
        var id = this._logging.getValue().id;
        return this._http.patch(LoggingService_1.URL + id, JSON.stringify(data))
            .then(function (obj) {
            var logging = _this._logging.getValue();
            for (var k in obj)
                logging[k] = obj[k]; // Copy
            _this._logging.next(logging);
            return logging;
        });
    };
    LoggingService.prototype.revert = function () {
        var _this = this;
        var id = this._logging.getValue().id;
        return this._http.delete(LoggingService_1.URL + id)
            .then(function () {
            _this.load(id);
        });
    };
    LoggingService.prototype.install = function () {
        var _this = this;
        this._status = status_1.Status.Starting;
        return this._http.post(LoggingService_1.URL, "")
            .then(function (doc) {
            _this._status = status_1.Status.Started;
            _this._logging.next(doc);
        })
            .catch(function (e) {
            _this.error = e;
            throw e;
        });
    };
    LoggingService.prototype.uninstall = function () {
        var _this = this;
        this._status = status_1.Status.Stopping;
        var id = this._logging.getValue().id;
        this._logging.next(null);
        return this._http.delete(LoggingService_1.URL + id)
            .then(function () {
            _this._status = status_1.Status.Stopped;
        })
            .catch(function (e) {
            _this.error = e;
            throw e;
        });
    };
    LoggingService.prototype.load = function (id) {
        var _this = this;
        return this._http.get(LoggingService_1.URL + id)
            .then(function (settings) {
            _this._status = status_1.Status.Started;
            _this._logging.next(settings);
            return settings;
        })
            .catch(function (e) {
            _this.error = e;
            if (e.type && e.type == api_error_1.ApiErrorType.FeatureNotInstalled) {
                _this._status = status_1.Status.Stopped;
            }
        });
    };
    Object.defineProperty(LoggingService.prototype, "logs", {
        //
        // Log Files
        //
        get: function () {
            return this._logs.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    LoggingService.prototype.loadLogs = function () {
        var _this = this;
        var settings = this._logging.getValue();
        if (!settings.directory || !settings.website) {
            return;
        }
        this._webSitesService.get(settings.website.id)
            .then(function (site) {
            settings.website = site;
            return _this._filesService.getByPhysicalPath(settings.directory + "/W3SVC" + settings.website.key)
                .then(function (logDir) {
                return _this._filesService.getChildren(logDir)
                    .then(function (logFiles) {
                    var logs = _this._logs.getValue();
                    logs.splice(0, logs.length);
                    logFiles.forEach(function (f) { return logs.push(f); });
                    _this._logs.next(logs);
                });
            });
        })
            .catch(function (e) {
            if (e.status && e.status == 404) {
                _this._notifications.clearWarnings();
            }
            throw e;
        });
    };
    LoggingService.prototype.delete = function (logs) {
        this._filesService.delete(logs);
    };
    LoggingService.URL = "/webserver/logging/";
    LoggingService = LoggingService_1 = __decorate([
        core_1.Injectable(),
        __param(3, core_1.Inject('FilesService')),
        __param(4, core_1.Inject('WebSitesService')),
        __metadata("design:paramtypes", [httpclient_1.HttpClient,
            router_1.ActivatedRoute,
            notification_service_1.NotificationService,
            files_service_1.FilesService,
            websites_service_1.WebSitesService])
    ], LoggingService);
    return LoggingService;
    var LoggingService_1;
}());
exports.LoggingService = LoggingService;
//# sourceMappingURL=logging.service.js.map