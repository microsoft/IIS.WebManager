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
var notification_service_1 = require("../../notification/notification.service");
var AuthenticationService = /** @class */ (function () {
    function AuthenticationService(_http, _notificationService, route) {
        this._http = _http;
        this._notificationService = _notificationService;
        this._settings = new BehaviorSubject_1.BehaviorSubject(null);
        this._anonAuth = new BehaviorSubject_1.BehaviorSubject(null);
        this._basicAuth = new BehaviorSubject_1.BehaviorSubject(null);
        this._digestAuth = new BehaviorSubject_1.BehaviorSubject(null);
        this._windowsAuth = new BehaviorSubject_1.BehaviorSubject(null);
        this._basicStatus = status_1.Status.Unknown;
        this._digestStatus = status_1.Status.Unknown;
        this._windowsStatus = status_1.Status.Unknown;
        this._webserverScope = route.snapshot.parent.url[0].path.toLocaleLowerCase() == 'webserver';
    }
    Object.defineProperty(AuthenticationService.prototype, "settings", {
        get: function () {
            return this._settings.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AuthenticationService.prototype, "anonAuth", {
        get: function () {
            return this._anonAuth.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AuthenticationService.prototype, "basicAuth", {
        get: function () {
            return this._basicAuth.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AuthenticationService.prototype, "digestAuth", {
        get: function () {
            return this._digestAuth.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AuthenticationService.prototype, "windowsAuth", {
        get: function () {
            return this._windowsAuth.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AuthenticationService.prototype, "basicStatus", {
        get: function () {
            return this._basicStatus;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AuthenticationService.prototype, "digestStatus", {
        get: function () {
            return this._digestStatus;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AuthenticationService.prototype, "windowsStatus", {
        get: function () {
            return this._windowsStatus;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AuthenticationService.prototype, "webserverScope", {
        get: function () {
            return this._webserverScope;
        },
        enumerable: true,
        configurable: true
    });
    AuthenticationService.prototype.initialize = function (id) {
        this.load(id);
    };
    AuthenticationService.prototype.load = function (id) {
        var _this = this;
        return this._http.get("/webserver/authentication/" + id)
            .then(function (feature) {
            _this._settings.next(feature);
            _this.loadAnon();
            _this.loadBasic();
            _this.loadDigest();
            _this.loadWindows();
            return feature;
        });
    };
    // All 4 authentication sub-modules share the same patch function, no type restriction
    AuthenticationService.prototype.update = function (feature, data) {
        var _this = this;
        return this._http.patch(feature._links.self.href.replace("/api", ""), JSON.stringify(data))
            .then(function (f) {
            diff_1.DiffUtil.set(feature, f);
            _this.getSubject(feature).next(feature);
            return feature;
        });
    };
    AuthenticationService.prototype.revert = function (feature) {
        var _this = this;
        return this._http.delete(feature._links.self.href.replace("/api", ""))
            .then(function (_) {
            return _this._http.get(feature._links.self.href.replace("/api", ""))
                .then(function (f) {
                diff_1.DiffUtil.set(feature, f);
                _this.getSubject(feature).next(feature);
                return feature;
            });
        });
    };
    AuthenticationService.prototype.installBasic = function (val) {
        var basic = "basic";
        if (val) {
            return this.installAuth(basic);
        }
        else {
            this.uninstallAuth(basic);
        }
    };
    AuthenticationService.prototype.installDigest = function (val) {
        var digest = "digest";
        if (val) {
            return this.installAuth(digest);
        }
        else {
            this.uninstallAuth(digest);
        }
    };
    AuthenticationService.prototype.installWindows = function (val) {
        var windows = "windows";
        if (val) {
            return this.installAuth(windows);
        }
        else {
            this.uninstallAuth(windows);
        }
    };
    AuthenticationService.prototype.loadAnon = function () {
        var _this = this;
        return this._http.get(this._settings.getValue()._links.anonymous.href.replace("/api", ""))
            .then(function (anonymous) {
            _this._anonAuth.next(anonymous);
            return anonymous;
        })
            .catch(function (e) {
            _this.anonymousError = e;
            throw e;
        });
    };
    AuthenticationService.prototype.loadBasic = function () {
        var _this = this;
        return this._http.get(this._settings.getValue()._links.basic.href.replace("/api", ""))
            .then(function (basic) {
            _this._basicStatus = status_1.Status.Started;
            _this._basicAuth.next(basic);
            return basic;
        })
            .catch(function (e) {
            _this.basicError = e;
            if (e.type && e.type == 'FeatureNotInstalled') {
                _this._basicStatus = status_1.Status.Stopped;
            }
            throw e;
        });
    };
    AuthenticationService.prototype.loadDigest = function () {
        var _this = this;
        return this._http.get(this._settings.getValue()._links.digest.href.replace("/api", ""))
            .then(function (digest) {
            _this._digestStatus = status_1.Status.Started;
            _this._digestAuth.next(digest);
            return digest;
        })
            .catch(function (e) {
            _this.digestError = e;
            if (e.type && e.type == 'FeatureNotInstalled') {
                _this._digestStatus = status_1.Status.Stopped;
            }
            throw e;
        });
    };
    AuthenticationService.prototype.loadWindows = function () {
        var _this = this;
        return this._http.get(this._settings.getValue()._links.windows.href.replace("/api", ""))
            .then(function (windows) {
            _this._windowsStatus = status_1.Status.Started;
            _this._windowsAuth.next(windows);
            return windows;
        })
            .catch(function (e) {
            _this.windowsError = e;
            if (e.type && e.type == 'FeatureNotInstalled') {
                _this._windowsStatus = status_1.Status.Stopped;
            }
            throw e;
        });
    };
    AuthenticationService.prototype.installAuth = function (type) {
        var _this = this;
        this.setStatus(type, status_1.Status.Starting);
        return this._http.post("/webserver/authentication/" + type + "-authentication/", "", null, false)
            .then(function (req) {
            _this.setStatus(type, status_1.Status.Started);
            if (type == 'windows') {
                _this.loadWindows();
            }
            else if (type == 'digest') {
                _this.loadDigest();
            }
            else if (type == 'basic') {
                _this.loadBasic();
            }
        })
            .catch(function (e) {
            _this["_" + type + "Error"] = e;
            _this.setStatus(type, status_1.Status.Stopped);
            _this._notificationService.warn("Unable to turn on " + type + " authentication.");
            throw e;
        });
    };
    AuthenticationService.prototype.uninstallAuth = function (type) {
        var _this = this;
        this.setStatus(type, status_1.Status.Stopping);
        var id = this["_" + type + "Auth"].getValue().id;
        this["_" + type + "Auth"].next(null);
        return this._http.delete("/webserver/authentication/" + type + "-authentication/" + id)
            .then(function () {
            _this.setStatus(type, status_1.Status.Stopped);
            // Confirm uninstall
            _this._http.get("/webserver/authentication/" + type + "-authentication/" + id)
                .then(function (auth) {
                _this["_" + type + "Auth"].next(auth);
                _this._notificationService.warn("Turning off " + type + " authentication failed.");
                _this.setStatus(type, status_1.Status.Started);
            });
        })
            .catch(function (e) {
            _this["_" + type + "Error"] = e;
            throw e;
        });
    };
    AuthenticationService.prototype.setStatus = function (type, val) {
        this["_" + type + "Status"] = val;
    };
    AuthenticationService.prototype.getSubject = function (feature) {
        if (this._anonAuth.getValue() === feature) {
            return this._anonAuth;
        }
        else if (this._basicAuth.getValue() === feature) {
            return this._basicAuth;
        }
        else if (this._digestAuth.getValue() === feature) {
            return this._digestAuth;
        }
        else if (this._windowsAuth.getValue() === feature) {
            return this._windowsAuth;
        }
        return null;
    };
    AuthenticationService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [httpclient_1.HttpClient,
            notification_service_1.NotificationService,
            router_1.ActivatedRoute])
    ], AuthenticationService);
    return AuthenticationService;
}());
exports.AuthenticationService = AuthenticationService;
//# sourceMappingURL=authentication.service.js.map