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
require("rxjs/add/operator/map");
require("rxjs/add/operator/toPromise");
var httpclient_1 = require("../../common/httpclient");
var ModuleService = /** @class */ (function () {
    function ModuleService(_http) {
        this._http = _http;
    }
    ModuleService.prototype.get = function (id) {
        var _this = this;
        return this.getFeature(id).then(function (f) {
            return _this.getModules(f).then(function (m) {
                return _this.getGlobalModules().then(function (g) {
                    return {
                        feature: f,
                        modules: m,
                        globalModules: g
                    };
                });
            });
        });
    };
    ModuleService.prototype.addModule = function (feature, module) {
        return this._http.post(feature._links.entries.href.replace("/api", ""), JSON.stringify(module));
    };
    ModuleService.prototype.addGlobalModule = function (module) {
        return this._http.post("/webserver/global-modules", JSON.stringify(module));
    };
    // Argument can be either managed module and global module
    ModuleService.prototype.removeModule = function (module) {
        return this._http.delete(module._links.self.href.replace("/api", ""));
    };
    ModuleService.prototype.patchFeature = function (feature, data) {
        return this._http.patch(feature._links.self.href.replace("/api", ""), JSON.stringify(data))
            .then(function (feature) {
            return feature;
        });
    };
    ModuleService.prototype.revert = function (id) {
        return this._http.delete("/webserver/http-modules/" + id);
    };
    ModuleService.prototype.getFeature = function (id) {
        return this._http.get("/webserver/http-modules/" + id)
            .then(function (feature) {
            return feature;
        });
    };
    ModuleService.prototype.getGlobalModules = function () {
        return this._http.get("/webserver/global-modules?fields=*")
            .then(function (arr) {
            return arr.global_modules;
        });
    };
    ModuleService.prototype.getModules = function (feature) {
        return this._http.get(feature._links.entries.href.replace("/api", "") + "&fields=*")
            .then(function (arr) {
            return arr.entries;
        });
    };
    ModuleService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [httpclient_1.HttpClient])
    ], ModuleService);
    return ModuleService;
}());
exports.ModuleService = ModuleService;
//# sourceMappingURL=modules.service.js.map