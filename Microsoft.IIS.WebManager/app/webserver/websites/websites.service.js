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
var BehaviorSubject_1 = require("rxjs/BehaviorSubject");
var diff_1 = require("../../utils/diff");
var httpclient_1 = require("../../common/httpclient");
var status_1 = require("../../common/status");
var webserver_service_1 = require("../webserver.service");
var app_pools_service_1 = require("../app-pools/app-pools.service");
var api_error_1 = require("../../error/api-error");
var notification_service_1 = require("../../notification/notification.service");
var WebSitesService = /** @class */ (function () {
    function WebSitesService(_http, _notificationService, webServerService, _appPoolService) {
        var _this = this;
        this._http = _http;
        this._notificationService = _notificationService;
        this._appPoolService = _appPoolService;
        this._loadedAppPools = new Set();
        this._data = new Map();
        this._webSites = new BehaviorSubject_1.BehaviorSubject(this._data);
        this._appPools = new Map();
        this._installStatus = status_1.Status.Unknown;
        this._subscriptions = [];
        //
        // Subscribe for WebServer Events
        if (webServerService) {
            this._subscriptions.push(webServerService.status.subscribe(function (status) {
                if (status == status_1.Status.Started || status == status_1.Status.Stopped) {
                    _this._data.forEach(function (s) {
                        s.status = status != status_1.Status.Stopped ? s._status : status_1.Status.Stopped;
                    });
                }
            }));
        }
        //
        // Subscribe for AppPools events
        if (this._appPoolService) {
            this._subscriptions.push(this._appPoolService.appPools.subscribe(function (pools) {
                if (pools.size == 0) {
                    return;
                }
                _this._appPools = pools;
                _this._data.forEach(function (s) {
                    if (s.application_pool) {
                        var pool = _this._appPools.get(s.application_pool.id);
                        if (pool && pool !== s.application_pool) {
                            var p = s.application_pool;
                            s.application_pool = pool;
                            if (s._full) {
                                diff_1.DiffUtil.merge(s.application_pool, p);
                            }
                        }
                    }
                });
            }));
        }
    }
    WebSitesService_1 = WebSitesService;
    Object.defineProperty(WebSitesService.prototype, "webSites", {
        get: function () {
            return this._webSites.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WebSitesService.prototype, "installStatus", {
        get: function () {
            return this._installStatus;
        },
        enumerable: true,
        configurable: true
    });
    WebSitesService.prototype.getAll = function () {
        var _this = this;
        if (this._all) {
            return Promise.resolve(this._data);
        }
        return this._http.get("/webserver/websites?fields=name,status,physical_path,bindings,application_pool")
            .then(function (res) {
            res.websites.forEach(function (s) { return _this.add(_this.fromJson(s)); });
            _this._all = true;
            _this._webSites.next(_this._data);
            return _this._data;
        })
            .catch(function (e) {
            _this.handleError(e, null);
            throw e;
        });
    };
    WebSitesService.prototype.getByAppPool = function (appPool) {
        var _this = this;
        //
        // Try the cache
        if (this._all || this._loadedAppPools.has(appPool.id)) {
            var result_1 = new Map();
            this._data.forEach(function (s) {
                if (s.application_pool && s.application_pool.id == appPool.id) {
                    result_1.set(s.id, s);
                }
            });
            return Promise.resolve(result_1);
        }
        return this._http.get("/webserver/websites?fields=name,status,physical_path,bindings,application_pool" + "&application_pool.id=" + appPool.id)
            .then(function (res) {
            res.websites.forEach(function (s) { return _this.add(_this.fromJson(s)); });
            _this._loadedAppPools.add(appPool.id);
            _this._webSites.next(_this._data);
            return _this.getByAppPool(appPool);
        })
            .catch(function (e) {
            _this.handleError(e, null);
            throw e;
        });
    };
    WebSitesService.prototype.get = function (id) {
        var _this = this;
        //
        // Try the cache
        var website = this._data.get(id);
        if (website && website._full) {
            return Promise.resolve(website);
        }
        return this._http.get("/webserver/websites/" + id + "?fields=*," + WebSitesService_1._appPoolFields)
            .then(function (s) {
            s._full = true;
            if (_this.add(_this.fromJson(s))) {
                _this._webSites.next(_this._data);
            }
            return _this._data.get(s.id);
        })
            .catch(function (e) {
            _this.handleError(e, null);
            throw e;
        });
    };
    WebSitesService.prototype.update = function (site, data) {
        var _this = this;
        return this._http.patch("/webserver/websites/" + site.id + "?fields=*," + WebSitesService_1._appPoolFields, JSON.stringify(data))
            .then(function (s) {
            if (_this.add(_this.fromJson(s))) {
                _this._webSites.next(_this._data);
            }
            return _this._data.get(s.id);
        })
            .catch(function (e) {
            _this.handleError(e, site);
            throw e;
        });
    };
    WebSitesService.prototype.start = function (site) {
        site.status = status_1.Status.Starting;
        return this._http.patch("/webserver/websites/" + site.id, JSON.stringify({ status: "started" }))
            .then(function (s) {
            site.status = s.status;
        });
    };
    WebSitesService.prototype.stop = function (site) {
        site.status = status_1.Status.Starting;
        return this._http.patch("/webserver/websites/" + site.id, JSON.stringify({ status: "stopped" }))
            .then(function (s) {
            site.status = s.status;
        });
    };
    WebSitesService.prototype.delete = function (webSite) {
        var _this = this;
        return this._http.delete("/webserver/websites/" + webSite.id)
            .then(function (_) {
            _this._data.delete(webSite.id);
            webSite.id = undefined; // Invalidate
            _this._webSites.next(_this._data);
        });
    };
    WebSitesService.prototype.create = function (site) {
        var _this = this;
        var creationData = JSON.parse(JSON.stringify(site));
        if (creationData.application_pool) {
            creationData.application_pool = { id: site.application_pool.id };
        }
        return this._http.post("/webserver/websites?fields=*," + WebSitesService_1._appPoolFields, JSON.stringify(creationData))
            .then(function (s) {
            _this.add(_this.fromJson(s));
            site.id = s.id;
            _this._webSites.next(_this._data);
            return _this._data.get(s.id);
        })
            .catch(function (e) {
            _this.handleError(e, site);
            throw e;
        });
    };
    WebSitesService.prototype.ngOnDestroy = function () {
        this._subscriptions.forEach(function (sub) {
            sub.unsubscribe();
        });
    };
    WebSitesService.prototype.getUrl = function (binding, path) {
        if (path === void 0) { path = ""; }
        // Schema
        var url = binding.is_https ? "https://" : "http://";
        // Host
        if (binding.hostname && binding.hostname.length > 0) {
            url += binding.hostname;
        }
        // IP Address
        else {
            if (binding.ip_address && binding.ip_address != "*") {
                url += binding.ip_address;
            }
            else {
                url += this._http.endpoint().hostname();
            }
        }
        // Port
        if (binding.port && binding.port != 80 && binding.port != 443) {
            url += ":" + binding.port;
        }
        // Path
        if (path && path.length > 0) {
            if (path.charAt(0) != '/') {
                url += "/";
            }
            url += path;
        }
        return url;
    };
    WebSitesService.prototype.fromJson = function (s) {
        s._status = s.status;
        // Link to AppPool
        if (s.application_pool) {
            var pool = this._appPools.get(s.application_pool.id);
            if (pool) {
                s.application_pool = pool;
            }
        }
        this.fillBindings(s);
        return s;
    };
    WebSitesService.prototype.add = function (s) {
        var site = this._data.get(s.id);
        if (!site) {
            // Add new
            this._data.set(s.id, s);
            return true;
        }
        else {
            // Update existing
            // Keep all _links
            var links = site._links;
            if (s.application_pool && site.application_pool) {
                diff_1.DiffUtil.merge(s.application_pool, site.application_pool);
            }
            for (var p in s) {
                site[p] = s[p];
            }
            for (var p in s._links) {
                links[p] = s._links[p];
            }
            site._links = links;
        }
        return false;
    };
    WebSitesService.prototype.fillBindings = function (s) {
        if (s.bindings != null) {
            for (var _i = 0, _a = s.bindings; _i < _a.length; _i++) {
                var b = _a[_i];
                // Protocol
                if (!b.protocol) {
                    b.binding_information = null;
                    if (b.is_https) {
                        b.protocol = "https";
                    }
                    else {
                        b.protocol = "http";
                    }
                }
                // is_https
                b.is_https = b.protocol === "https";
                // Binding information
                if (b.protocol.indexOf("http") === 0) {
                    b.binding_information = null;
                }
            }
        }
    };
    WebSitesService.prototype.handleError = function (e, site) {
        this.error = e;
        if (e.type && e.type == api_error_1.ApiErrorType.FeatureNotInstalled) {
            this._installStatus = status_1.Status.Stopped;
        }
        if (e.title && e.title.toLowerCase() == 'forbidden' && e.name == 'physical_path') {
            this._notificationService.warn("Access denied\n\n" + site.physical_path);
        }
    };
    WebSitesService._appPoolFields = "application_pool.name,application_pool.auto_start,application_pool.status,application_pool.identity,application_pool.pipeline_mode,application_pool.managed_runtime_version";
    WebSitesService = WebSitesService_1 = __decorate([
        core_1.Injectable(),
        __param(2, core_1.Optional()), __param(2, core_1.Inject("WebServerService")),
        __param(3, core_1.Optional()), __param(3, core_1.Inject("AppPoolsService")),
        __metadata("design:paramtypes", [httpclient_1.HttpClient,
            notification_service_1.NotificationService,
            webserver_service_1.WebServerService,
            app_pools_service_1.AppPoolsService])
    ], WebSitesService);
    return WebSitesService;
    var WebSitesService_1;
}());
exports.WebSitesService = WebSitesService;
//# sourceMappingURL=websites.service.js.map