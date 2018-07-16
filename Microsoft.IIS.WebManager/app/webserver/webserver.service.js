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
var IntervalObservable_1 = require("rxjs/observable/IntervalObservable");
var BehaviorSubject_1 = require("rxjs/BehaviorSubject");
var status_1 = require("../common/status");
var httpclient_1 = require("../common/httpclient");
var notification_service_1 = require("../notification/notification.service");
var api_error_1 = require("../error/api-error");
var webserver_1 = require("./webserver");
var WebServerService = /** @class */ (function () {
    function WebServerService(_http, _notificationService) {
        this._http = _http;
        this._notificationService = _notificationService;
        this._statusChanged = new BehaviorSubject_1.BehaviorSubject(status_1.Status.Unknown);
        this._installStatus = status_1.Status.Unknown;
    }
    Object.defineProperty(WebServerService.prototype, "status", {
        get: function () {
            return this._statusChanged.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WebServerService.prototype, "installStatus", {
        get: function () {
            return this._installStatus;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WebServerService.prototype, "server", {
        get: function () {
            if (this._server) {
                return Promise.resolve(this._server);
            }
            return this.get();
        },
        enumerable: true,
        configurable: true
    });
    WebServerService.prototype.start = function () {
        var _this = this;
        return this.updateStatus("started").then(function (ws) {
            _this.triggerStatusUpdate();
            if (ws.status == status_1.Status.Starting) {
                //
                // Ping
                var ob_1 = IntervalObservable_1.IntervalObservable.create(1000).subscribe(function (i) {
                    _this.get().then(function (s) {
                        if (s.status != status_1.Status.Starting || i >= 90) {
                            ob_1.unsubscribe();
                        }
                        return ws;
                    });
                });
            }
            else {
                return ws;
            }
        });
    };
    WebServerService.prototype.stop = function () {
        var _this = this;
        return this.updateStatus("stopped").then(function (ws) {
            _this.triggerStatusUpdate();
            if (ws.status == status_1.Status.Stopping) {
                return new Promise(function (resolve, reject) {
                    //
                    // Ping
                    var ob = IntervalObservable_1.IntervalObservable.create(1000).subscribe(function (i) {
                        _this.get().then(function (s) {
                            if (s.status != status_1.Status.Stopping || i >= 90) {
                                ob.unsubscribe();
                                resolve(ws);
                            }
                        });
                    });
                });
            }
            else {
                return ws;
            }
        });
    };
    WebServerService.prototype.restart = function () {
        var _this = this;
        if (this._statusChanged.getValue() != status_1.Status.Started) {
            this.start();
            return;
        }
        this.stop().then(function () { return _this.start(); });
    };
    WebServerService.prototype.get = function () {
        var _this = this;
        return this._http.get("/webserver").then(function (ws) {
            _this._server = new webserver_1.WebServer();
            _this._server.id = ws.id;
            _this._server._links = ws._links;
            //
            // Query Info
            if (!_this._server._links || !_this._server._links.info) {
                return _this._server;
            }
            return _this._http.get(_this._server._links.info.href.replace("/api", "")).then(function (info) {
                _this._server.name = info.name;
                _this._server.status = info.status;
                _this._server.version = info.version;
                _this._server.supports_sni = info.supports_sni;
                _this.triggerStatusUpdate();
                return _this._server;
            });
        })
            .catch(function (e) {
            _this.error = e;
            if (e.type && e.type == api_error_1.ApiErrorType.FeatureNotInstalled) {
                _this._installStatus = status_1.Status.Stopped;
            }
        });
    };
    WebServerService.prototype.updateStatus = function (status) {
        var _this = this;
        if (!this._server._links || !this._server._links.service_controller) {
            return Promise.resolve(this._server);
        }
        return this._http.patch(this._server._links.service_controller.href.replace("/api", ""), JSON.stringify({ status: status }))
            .then(function (sc) {
            _this._server.status = sc.status; // Update the status
            return _this._server;
        });
    };
    WebServerService.prototype.triggerStatusUpdate = function () {
        if (this._statusChanged.getValue() != this._server.status) {
            this._statusChanged.next(this._server.status);
        }
    };
    WebServerService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [httpclient_1.HttpClient,
            notification_service_1.NotificationService])
    ], WebServerService);
    return WebServerService;
}());
exports.WebServerService = WebServerService;
//# sourceMappingURL=webserver.service.js.map