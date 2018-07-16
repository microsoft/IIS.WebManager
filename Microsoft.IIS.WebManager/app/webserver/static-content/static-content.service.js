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
var StaticContentService = /** @class */ (function () {
    function StaticContentService(_http, route) {
        this._http = _http;
        this._status = status_1.Status.Unknown;
        this._mimeMaps = new BehaviorSubject_1.BehaviorSubject([]);
        this._staticContent = new BehaviorSubject_1.BehaviorSubject(null);
        this._webserverScope = route.snapshot.parent.url[0].path.toLocaleLowerCase() == 'webserver';
    }
    StaticContentService_1 = StaticContentService;
    Object.defineProperty(StaticContentService.prototype, "status", {
        get: function () {
            return this._status;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StaticContentService.prototype, "webserverScope", {
        get: function () {
            return this._webserverScope;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StaticContentService.prototype, "mimeMaps", {
        get: function () {
            return this._mimeMaps.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StaticContentService.prototype, "staticContent", {
        get: function () {
            return this._staticContent.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    StaticContentService.prototype.initialize = function (id) {
        var _this = this;
        this.load(id).then(function () { return _this.loadMaps(); });
    };
    //
    // Static Content
    StaticContentService.prototype.update = function (data) {
        var _this = this;
        var id = this._staticContent.getValue().id;
        return this._http.patch(this._staticContent.getValue()._links.self.href.replace("/api", ""), JSON.stringify(data))
            .then(function (feature) {
            var staticContent = _this._staticContent.getValue();
            diff_1.DiffUtil.set(staticContent, feature);
            _this._staticContent.next(staticContent);
        });
    };
    StaticContentService.prototype.revert = function () {
        var _this = this;
        var id = this._staticContent.getValue().id;
        return this._http.delete(StaticContentService_1.URL + id)
            .then(function () { return _this.initialize(id); });
    };
    StaticContentService.prototype.load = function (id) {
        var _this = this;
        return this._http.get(StaticContentService_1.URL + id)
            .then(function (feature) {
            _this._status = status_1.Status.Started;
            _this._staticContent.next(feature);
            return feature;
        })
            .catch(function (e) {
            _this.error = e;
            if (e.type && e.type == api_error_1.ApiErrorType.FeatureNotInstalled) {
                _this._status = status_1.Status.Stopped;
            }
            throw e;
        });
    };
    StaticContentService.prototype.install = function () {
        var _this = this;
        this._status = status_1.Status.Starting;
        return this._http.post(StaticContentService_1.URL, "")
            .then(function (doc) {
            _this._status = status_1.Status.Started;
            _this._staticContent.next(doc);
        })
            .catch(function (e) {
            _this.error = e;
            throw e;
        });
    };
    StaticContentService.prototype.uninstall = function () {
        var _this = this;
        this._status = status_1.Status.Stopping;
        var id = this._staticContent.getValue().id;
        this._staticContent.next(null);
        return this._http.delete(StaticContentService_1.URL + id)
            .then(function () {
            _this._status = status_1.Status.Stopped;
        })
            .catch(function (e) {
            _this.error = e;
            throw e;
        });
    };
    //
    // Mime Maps
    StaticContentService.prototype.addMap = function (map) {
        var _this = this;
        map.static_content = this._staticContent.getValue();
        return this._http.post(this._staticContent.getValue()._links.mime_maps.href.replace("/api", ""), JSON.stringify(map))
            .then(function (map) {
            _this._mimeMaps.getValue().unshift(map);
            _this._mimeMaps.next(_this._mimeMaps.getValue());
        });
    };
    StaticContentService.prototype.updateMap = function (map, data) {
        return this._http.patch(map._links.self.href.replace("/api", ""), JSON.stringify(data))
            .then(function (m) {
            diff_1.DiffUtil.set(map, m);
            return map;
        });
    };
    StaticContentService.prototype.deleteMap = function (map) {
        var _this = this;
        return this._http.delete(map._links.self.href.replace("/api", ""))
            .then(function () {
            var maps = _this._mimeMaps.getValue().filter(function (m) { return m !== map; });
            _this._mimeMaps.next(maps);
        });
        ;
    };
    StaticContentService.prototype.loadMaps = function () {
        var _this = this;
        return this._http.get(this._staticContent.getValue()._links.mime_maps.href.replace("/api", "") + "&fields=*")
            .then(function (obj) {
            var maps = obj.mime_maps;
            _this._mimeMaps.next(maps);
            return maps;
        });
    };
    StaticContentService.URL = "/webserver/static-content/";
    StaticContentService = StaticContentService_1 = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [httpclient_1.HttpClient, router_1.ActivatedRoute])
    ], StaticContentService);
    return StaticContentService;
    var StaticContentService_1;
}());
exports.StaticContentService = StaticContentService;
//# sourceMappingURL=static-content.service.js.map