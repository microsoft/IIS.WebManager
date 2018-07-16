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
var http_1 = require("@angular/http");
require("rxjs/add/operator/toPromise");
var BehaviorSubject_1 = require("rxjs/BehaviorSubject");
var httpconnection_1 = require("./httpconnection");
var connection_store_1 = require("./connection-store");
var notification_service_1 = require("../notification/notification.service");
var ConnectService = /** @class */ (function () {
    function ConnectService(_http, _router, _notificationSvc) {
        var _this = this;
        this._http = _http;
        this._router = _router;
        this._notificationSvc = _notificationSvc;
        this._pingPopup = new PWrapper();
        this._connecting = new BehaviorSubject_1.BehaviorSubject(null);
        this._edit = new BehaviorSubject_1.BehaviorSubject(null);
        this._client = new httpconnection_1.HttpConnection(_http);
        this._store = new connection_store_1.ConnectionStore();
        this.active.subscribe(function (c) {
            _this._active = c;
        });
    }
    ConnectService_1 = ConnectService;
    Object.defineProperty(ConnectService.prototype, "connections", {
        get: function () {
            return this._store.connections;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConnectService.prototype, "active", {
        get: function () {
            return this._store.active;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConnectService.prototype, "connecting", {
        get: function () {
            return this._connecting.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConnectService.prototype, "editting", {
        get: function () {
            return this._edit.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    ConnectService.prototype.connect = function (conn, popup) {
        var _this = this;
        if (popup === void 0) { popup = true; }
        this.reset();
        this._connecting.next(conn);
        // If we tried this previously close the ping window, safe to call close multiple times
        this._pingPopup.close();
        // Open ping popup window which can only be opened as the result of a user click event
        if (popup) {
            this._pingPopup.open(conn.url + "/ping");
            // Raw request to url causes certificate acceptance prompt on IE.
            this._client.raw(conn, "/api").toPromise().then(function (_) { }).catch(function (e) {
                // Ignore errors
            });
        }
        return this._client.get(conn, "/api").toPromise()
            .then(function (_) {
            _this.complete(conn);
            return Promise.resolve(conn);
        })
            .catch(function (_) {
            _this.gotoConnect(true);
            return _this.ping(conn, new Date().getTime() + ConnectService_1.PING_TIMEOUT, popup);
        });
    };
    ConnectService.prototype.reconnect = function () {
        if (this._active) {
            this.connect(this._active, false);
        }
    };
    ConnectService.prototype.cancel = function () {
        this._notificationSvc.clearWarnings();
        this.reset();
        if (this._connecting.getValue()) {
            this._connecting.next(null);
        }
    };
    ConnectService.prototype.save = function (conn) {
        this._store.save(conn);
    };
    ConnectService.prototype.delete = function (conn) {
        var deletingActive = conn == this._active;
        this._store.delete(conn);
        if (deletingActive) {
            this._router.navigate(['/connect']);
        }
    };
    ConnectService.prototype.edit = function (conn) {
        this._edit.next(conn);
        this._router.navigate(['/connect']);
    };
    ConnectService.prototype.gotoConnect = function (skipGet) {
        var totalConnections = 0;
        this._store.connections.subscribe(function (conns) { return totalConnections = conns.length; }).unsubscribe();
        if (totalConnections == 0 && !skipGet) {
            // Goto Get
            this._router.navigate(['/get']);
        }
        else {
            this._router.navigate(['/connect']);
        }
    };
    ConnectService.prototype.activate = function (conn) {
        this._store.setActive(conn);
    };
    ConnectService.prototype.ping = function (conn, time2stop, force) {
        var _this = this;
        clearTimeout(this._pingTimeoutId);
        return this._client.get(conn, "/api").toPromise()
            .then(function (_) {
            _this.complete(conn);
            return Promise.resolve(conn);
        })
            .catch(function (e) {
            if (e.status == 403) {
                _this.error(conn, function (_) { return _this._notificationSvc.invalidAccessToken(); });
                return Promise.reject("Could not connect.");
            }
            else {
                return _this._client.options(conn, "/api").toPromise()
                    .then(function (_) {
                    // 
                    // It could be a race in between the initial GET and this OPTIONS, so try one more time
                    // If still fails, it's likely that an Integrated Authentication rejected the request
                    _this._client.get(conn, "/api").toPromise()
                        .then(function (_) { return _this.complete(conn); })
                        .catch(function (e) {
                        if (force) {
                            // Force ping loop so the connecting screen opens
                            _this._notificationSvc.unauthorized();
                            return _this.pingLoop(conn, time2stop);
                        }
                        else {
                            // Notify that the user is unauthorized but don't force the connecting page
                            _this.error(conn, function (_) { return _this._notificationSvc.unauthorized(); });
                            return Promise.reject("Could not connect.");
                        }
                    });
                })
                    .catch(function (e) {
                    return _this.pingLoop(conn, time2stop);
                });
            }
        });
    };
    ConnectService.prototype.pingLoop = function (conn, time2stop) {
        var _this = this;
        var interval = 1000; // 1s
        //
        // API not running, CORs not allowed or Cert not trusted
        var timeout = time2stop - new Date().getTime();
        return new Promise(function (resolve, reject) {
            if (timeout > 0) {
                if (_this._connecting.getValue()) {
                    _this._pingTimeoutId = setTimeout(function (_) {
                        _this.ping(conn, time2stop, true)
                            .then(function (_) {
                            resolve(conn);
                        })
                            .catch(function (e) {
                            reject(e);
                        });
                    }, interval);
                }
            }
            else {
                _this.error(conn, function (_) { return _this._notificationSvc.remoteServerCantBeReached(conn); });
                reject("Could not connect.");
            }
        });
    };
    ConnectService.prototype.complete = function (conn) {
        this.reset();
        try {
            this.activate(conn);
            this._connecting.next(null);
        }
        catch (e) {
            console.log(e);
        }
        window.location.href = "/";
    };
    ConnectService.prototype.error = function (conn, svc) {
        var connecting = this._connecting.getValue();
        this.reset(false);
        if (!connecting) {
            return;
        }
        try {
            this._connecting.next(null);
        }
        catch (e) {
            console.log(e);
        }
        if (svc) {
            svc();
        }
    };
    ConnectService.prototype.reset = function (clearError) {
        if (clearError === void 0) { clearError = true; }
        clearTimeout(this._pingTimeoutId);
        this._pingTimeoutId = 0;
        if (clearError) {
            this._notificationSvc.clearWarnings();
        }
        this._pingPopup.close();
    };
    ConnectService.PING_TIMEOUT = 120 * 1000; // 2min
    ConnectService = ConnectService_1 = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [http_1.Http,
            router_1.Router,
            notification_service_1.NotificationService])
    ], ConnectService);
    return ConnectService;
    var ConnectService_1;
}());
exports.ConnectService = ConnectService;
var PWrapper = /** @class */ (function () {
    function PWrapper() {
        this.popup = null;
        this.isOpen = false;
    }
    PWrapper.prototype.open = function (url) {
        if (!this.isOpen) {
            this.isOpen = true;
            // IE returns null when opening window to untrusted cert
            this.popup = window.open(url);
        }
    };
    ;
    PWrapper.prototype.close = function () {
        if (this.isOpen) {
            // Edge implementation of window.open can return null
            // Checking it for null does not throw CORS error
            if (this.popup != null) {
                this.popup.close();
            }
            this.isOpen = false;
        }
    };
    ;
    return PWrapper;
}());
//# sourceMappingURL=connect.service.js.map