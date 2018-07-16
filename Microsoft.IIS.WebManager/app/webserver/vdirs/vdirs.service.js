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
var notification_service_1 = require("../../notification/notification.service");
var websites_service_1 = require("../websites/websites.service");
var webapps_service_1 = require("../webapps/webapps.service");
var VdirsService = /** @class */ (function () {
    function VdirsService(_http, _notificationService, _webSitesService, _webAppsService) {
        var _this = this;
        this._http = _http;
        this._notificationService = _notificationService;
        this._webSitesService = _webSitesService;
        this._webAppsService = _webAppsService;
        this._data = new Map();
        this._vdirs = new BehaviorSubject_1.BehaviorSubject(this._data);
        this._webSites = new Map();
        this._webApps = new Map();
        this._loadedWebSites = new Set();
        this._loadedWebApps = new Set();
        this._subscriptions = [];
        //
        // Subscribe for WebSites events
        if (this._webSitesService) {
            this._webSitesService.webSites.subscribe(function (sites) {
                if (sites.size == 0) {
                    return;
                }
                _this._webSites = sites;
                var vdirsCount = _this._data.size;
                _this._data.forEach(function (vdir) {
                    if (!vdir.website.id) {
                        _this._data.delete(vdir.id);
                        vdir.id = undefined;
                    }
                    else {
                        var site = _this._webSites.get(vdir.website.id);
                        if (site) {
                            vdir.website = site;
                        }
                    }
                });
                if (vdirsCount != _this._data.size) {
                    _this._vdirs.next(_this._data);
                }
            });
        }
        // Subscrive for WebApps events
        if (this._webAppsService) {
            this._webAppsService.webApps.subscribe(function (apps) {
                if (apps.size == 0) {
                    return;
                }
                _this._webApps = apps;
                var vdirsCount = _this._data.size;
                _this._data.forEach(function (vdir) {
                    if (!vdir.webapp.id) {
                        _this._data.delete(vdir.id);
                        vdir.id = undefined;
                    }
                    else {
                        var app = _this._webApps.get(vdir.webapp.id);
                        if (app) {
                            vdir.webapp = app;
                        }
                    }
                });
                if (vdirsCount != _this._data.size) {
                    _this._vdirs.next(_this._data);
                }
            });
        }
    }
    VdirsService_1 = VdirsService;
    Object.defineProperty(VdirsService.prototype, "vdirs", {
        get: function () {
            return this._vdirs.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    VdirsService.prototype.getBySite = function (website) {
        var _this = this;
        //
        // Try the cache
        if (this._loadedWebSites.has(website.id)) {
            var result_1 = new Map();
            this._data.forEach(function (vdir) {
                if (vdir.website.id == website.id) {
                    result_1.set(vdir.id, vdir);
                }
            });
            return Promise.resolve(result_1);
        }
        return this._http.get("/webserver/virtual-directories?website.id=" + website.id + "&fields=*," + VdirsService_1._webSiteFields)
            .then(function (res) {
            res.virtual_directories.forEach(function (vdir) { return _this._data.set(vdir.id, _this.fromJson(vdir)); });
            _this._loadedWebSites.add(website.id);
            _this._vdirs.next(_this._data);
            return _this.getBySite(website);
        });
    };
    VdirsService.prototype.getByApp = function (webapp) {
        var _this = this;
        //
        // Try the cache
        if (this._loadedWebApps.has(webapp.id)) {
            var result_2 = new Map();
            this._data.forEach(function (vdir) {
                if (vdir.webapp.id == webapp.id) {
                    result_2.set(vdir.id, vdir);
                }
            });
            return Promise.resolve(result_2);
        }
        return this._http.get("/webserver/virtual-directories?webapp.id=" + webapp.id + "&fields=*," + VdirsService_1._webSiteFields)
            .then(function (res) {
            res.virtual_directories.forEach(function (vdir) { return _this._data.set(vdir.id, _this.fromJson(vdir)); });
            _this._loadedWebApps.add(webapp.id);
            _this._vdirs.next(_this._data);
            return _this.getByApp(webapp);
        });
    };
    VdirsService.prototype.get = function (id) {
        var _this = this;
        //
        // Try the cache
        var vdir = this._data.get(id);
        if (vdir) {
            return Promise.resolve(vdir);
        }
        return this._http.get("/webserver/virtual-directories/" + id + "?fields=*," + VdirsService_1._webSiteFields)
            .then(function (v) {
            _this._data.set(v.id, v);
            _this._vdirs.next(_this._data);
            return v;
        });
    };
    VdirsService.prototype.update = function (vdir) {
        var _this = this;
        if (!this._data.has(vdir.id)) {
            this._data.set(vdir.id, vdir);
            this._vdirs.next(this._data);
        }
        return this._http.patch("/webserver/virtual-directories/" + vdir.id + "?fields=*," + VdirsService_1._webSiteFields, JSON.stringify(vdir))
            .then(function (v) {
            for (var p in v)
                vdir[p] = v[p];
            return vdir;
        })
            .catch(function (e) {
            _this.handleError(e, vdir);
            throw e;
        });
    };
    VdirsService.prototype.create = function (vdir) {
        var _this = this;
        return this._http.post("/webserver/virtual-directories" + "?fields=*," + VdirsService_1._webSiteFields, JSON.stringify(vdir))
            .then(function (v) {
            _this._data.set(v.id, v);
            vdir.id = v.id;
            _this._vdirs.next(_this._data);
            return _this._data.get(v.id);
        })
            .catch(function (e) {
            _this.handleError(e, vdir);
            throw e;
        });
    };
    VdirsService.prototype.delete = function (vdir) {
        var _this = this;
        if (!vdir.id) {
            this._vdirs.next(this._data);
            return Promise.resolve();
        }
        return this._http.delete("/webserver/virtual-directories/" + vdir.id)
            .then(function (_) {
            _this._data.delete(vdir.id);
            vdir.id = undefined;
            _this._vdirs.next(_this._data);
        });
    };
    VdirsService.prototype.destroy = function () {
        this._subscriptions.forEach(function (sub) {
            sub.unsubscribe();
        });
    };
    VdirsService.prototype.fromJson = function (vdir) {
        // Reference WebSite
        var site = this._webSites.get(vdir.website.id);
        if (site) {
            vdir.website = site;
        }
        // Reference WebApp
        var app = this._webApps.get(vdir.webapp.id);
        if (app) {
            vdir.webapp = app;
        }
        return vdir;
    };
    VdirsService.prototype.handleError = function (e, vdir) {
        if (e.title && e.title.toLowerCase() == 'forbidden' && e.name == 'physical_path') {
            this._notificationService.warn("Access denied\n\n" + vdir.physical_path);
        }
    };
    VdirsService._webSiteFields = "website.name,website.status,website.bindings";
    VdirsService = VdirsService_1 = __decorate([
        core_1.Injectable(),
        __param(2, core_1.Optional()), __param(2, core_1.Inject("WebSitesService")),
        __param(3, core_1.Optional()), __param(3, core_1.Inject("WebAppsService")),
        __metadata("design:paramtypes", [httpclient_1.HttpClient,
            notification_service_1.NotificationService,
            websites_service_1.WebSitesService,
            webapps_service_1.WebAppsService])
    ], VdirsService);
    return VdirsService;
    var VdirsService_1;
}());
exports.VdirsService = VdirsService;
//# sourceMappingURL=vdirs.service.js.map