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
var httpclient_1 = require("../../common/httpclient");
var websites_service_1 = require("../websites/websites.service");
var app_pools_service_1 = require("../app-pools/app-pools.service");
var notification_service_1 = require("../../notification/notification.service");
var WebAppsService = /** @class */ (function () {
    function WebAppsService(_http, _notificationService, _appPoolService, _webSitesService) {
        var _this = this;
        this._http = _http;
        this._notificationService = _notificationService;
        this._appPoolService = _appPoolService;
        this._webSitesService = _webSitesService;
        this._data = new Map();
        this._webApps = new BehaviorSubject_1.BehaviorSubject(this._data);
        this._appPools = new Map();
        this._webSites = new Map();
        this._loadedAppPools = new Set();
        this._loadedWebSites = new Set();
        this._subscriptions = [];
        //
        // Subscribe for AppPools events
        if (this._appPoolService) {
            this._subscriptions.push(this._appPoolService.appPools.subscribe(function (pools) {
                if (pools.size == 0) {
                    return;
                }
                _this._appPools = pools;
                _this._data.forEach(function (app) {
                    if (app.application_pool) {
                        var pool = _this._appPools.get(app.application_pool.id);
                        if (pool || !app.application_pool.id) {
                            app.application_pool = pool;
                        }
                    }
                });
            }));
        }
        //
        // Subscribe for WebSites events
        if (this._webSitesService) {
            this._subscriptions.push(this._webSitesService.webSites.subscribe(function (sites) {
                if (sites.size == 0) {
                    return;
                }
                _this._webSites = sites;
                var appsCount = _this._data.size;
                _this._data.forEach(function (app) {
                    if (!app.website.id) {
                        // The WebSite has been deleted. Remove the app
                        _this._data.delete(app.id);
                        app.id = undefined;
                    }
                    else {
                        var site = _this._webSites.get(app.website.id);
                        if (site) {
                            app.website = site;
                        }
                    }
                });
                if (appsCount != _this._data.size) {
                    _this._webApps.next(_this._data);
                }
            }));
        }
    }
    WebAppsService_1 = WebAppsService;
    Object.defineProperty(WebAppsService.prototype, "webApps", {
        get: function () {
            return this._webApps.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    WebAppsService.prototype.getBySite = function (website) {
        var _this = this;
        //
        // Try the cache
        if (this._loadedWebSites.has(website.id)) {
            var result_1 = new Map();
            this._data.forEach(function (app) {
                if (app.website.id == website.id) {
                    result_1.set(app.id, app);
                }
            });
            return Promise.resolve(result_1);
        }
        return this._http.get("/webserver/webapps?fields=path,physical_path,application_pool,location," + WebAppsService_1._webSiteFields + "&website.id=" + website.id)
            .then(function (res) {
            res.webapps.forEach(function (app) { return _this._data.set(app.id, _this.fromJson(app)); });
            _this._loadedWebSites.add(website.id);
            _this._webApps.next(_this._data);
            return _this.getBySite(website);
        });
    };
    WebAppsService.prototype.getByAppPool = function (appPool) {
        var _this = this;
        //
        // Try the cache
        if (this._loadedAppPools.has(appPool.id)) {
            var result_2 = new Map();
            this._data.forEach(function (app) {
                if (app.application_pool && app.application_pool.id == appPool.id) {
                    result_2.set(app.id, app);
                }
            });
            return Promise.resolve(result_2);
        }
        return this._http.get("/webserver/webapps?fields=path,physical_path,application_pool," + WebAppsService_1._webSiteFields + "&application_pool.id=" + appPool.id)
            .then(function (res) {
            res.webapps.forEach(function (app) { return _this._data.set(app.id, _this.fromJson(app)); });
            _this._loadedAppPools.add(appPool.id);
            _this._webApps.next(_this._data);
            return _this.getByAppPool(appPool);
        });
    };
    WebAppsService.prototype.get = function (id) {
        var _this = this;
        //
        // Try the cache
        var app = this._data.get(id);
        if (app) {
            return Promise.resolve(app);
        }
        return this._http.get("/webserver/webapps/" + id + "?fields=*," + WebAppsService_1._webSiteFields + "," + WebAppsService_1._appPoolFields)
            .then(function (app) {
            _this._data.set(app.id, _this.fromJson(app));
            _this._webApps.next(_this._data);
            return app;
        });
    };
    WebAppsService.prototype.delete = function (app) {
        var _this = this;
        return this._http.delete("/webserver/webapps/" + app.id)
            .then(function (_) {
            _this._data.delete(app.id);
            app.id = undefined; // Invalidate
            _this._webApps.next(_this._data);
        });
    };
    WebAppsService.prototype.create = function (data) {
        var _this = this;
        if (!data.website) {
            throw new Error("Invalid WebSite");
        }
        var createData = JSON.parse(JSON.stringify(data));
        createData.website = { id: data.website.id };
        if (createData.application_pool) {
            createData.application_pool = { id: data.application_pool.id };
        }
        return this._http.post("/webserver/webapps?fields=*," + WebAppsService_1._webSiteFields + "," + WebAppsService_1._appPoolFields, JSON.stringify(createData))
            .then(function (a) {
            _this._data.set(a.id, _this.fromJson(a));
            data.id = a.id;
            _this._webApps.next(_this._data);
            return _this._data.get(a.id);
        })
            .catch(function (e) {
            _this.handleError(e, data);
            throw e;
        });
    };
    WebAppsService.prototype.update = function (app, data) {
        var _this = this;
        return this._http.patch("/webserver/webapps/" + app.id + "?fields=*," + WebAppsService_1._webSiteFields + "," + WebAppsService_1._appPoolFields, JSON.stringify(data))
            .then(function (a) {
            //
            // Path change will change the id
            if (app.id != a.id) {
                _this._data.delete(app.id);
                _this._data.set(a.id, app);
            }
            // Update all properties
            for (var k in a)
                app[k] = a[k];
            return app;
        })
            .catch(function (e) {
            _this.handleError(e, data);
            throw e;
        });
    };
    WebAppsService.prototype.destroy = function () {
        this._subscriptions.forEach(function (sub) {
            sub.unsubscribe();
        });
    };
    WebAppsService.prototype.fromJson = function (app) {
        // Reference AppPool
        if (app.application_pool) {
            var pool = this._appPools.get(app.application_pool.id);
            if (pool) {
                app.application_pool = pool;
            }
        }
        // Reference WebSite
        var site = this._webSites.get(app.website.id);
        if (site) {
            app.website = site;
        }
        return app;
    };
    WebAppsService.prototype.handleError = function (e, app) {
        if (e.title && e.title.toLowerCase() == 'forbidden' && e.name == 'physical_path') {
            this._notificationService.warn("Access denied\n\n" + app.physical_path);
        }
    };
    WebAppsService._webSiteFields = "website.name,website.status,website.bindings";
    WebAppsService._appPoolFields = "application_pool.name,application_pool.status,application_pool.identity,application_pool.pipeline_mode,application_pool.managed_runtime_version";
    WebAppsService._listUrl = "/webserver/webapps?fields=*";
    WebAppsService = WebAppsService_1 = __decorate([
        core_1.Injectable(),
        __param(2, core_1.Optional()), __param(2, core_1.Inject("AppPoolsService")),
        __param(3, core_1.Optional()), __param(3, core_1.Inject("WebSitesService")),
        __metadata("design:paramtypes", [httpclient_1.HttpClient,
            notification_service_1.NotificationService,
            app_pools_service_1.AppPoolsService,
            websites_service_1.WebSitesService])
    ], WebAppsService);
    return WebAppsService;
    var WebAppsService_1;
}());
exports.WebAppsService = WebAppsService;
//# sourceMappingURL=webapps.service.js.map