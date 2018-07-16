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
var websites_service_1 = require("./websites.service");
var app_pool_1 = require("../app-pools/app-pool");
var WebSiteListComponent = /** @class */ (function () {
    function WebSiteListComponent(_service) {
        this._service = _service;
        this._subs = [];
    }
    WebSiteListComponent.prototype.ngOnInit = function () {
        if (!this.lazy) {
            this.activate();
        }
    };
    WebSiteListComponent.prototype.ngOnDestroy = function () {
        this._subs.forEach(function (s) { return s.unsubscribe(); });
    };
    WebSiteListComponent.prototype.activate = function () {
        var _this = this;
        this.lazy = false;
        if (this._sites) {
            return;
        }
        if (this.appPool) {
            this._service.getByAppPool(this.appPool).then(function (_) {
                _this._subs.push(_this._service.webSites.subscribe(function (sites) {
                    _this._sites = [];
                    sites.forEach(function (s) {
                        if (s.application_pool && s.application_pool.id == _this.appPool.id) {
                            _this._sites.push(s);
                        }
                    });
                }));
            });
        }
        else {
            this._service.getAll().then(function (_) {
                _this._subs.push(_this._service.webSites.subscribe(function (sites) {
                    _this._sites = [];
                    sites.forEach(function (s) { return _this._sites.push(s); });
                }));
            });
        }
    };
    WebSiteListComponent.prototype.fields = function () {
        if (this.appPool) {
            return "name,path,status";
        }
        return "name,path,status,app-pool";
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", app_pool_1.ApplicationPool)
    ], WebSiteListComponent.prototype, "appPool", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], WebSiteListComponent.prototype, "lazy", void 0);
    WebSiteListComponent = __decorate([
        core_1.Component({
            template: "\n        <loading *ngIf=\"!_sites && !lazy && !_service.error\"></loading>\n        <div *ngIf=\"_service.installStatus == 'stopped'\" class=\"not-installed\">\n            <p>\n                Web Server (IIS) is not installed on the machine\n                <br/>\n                <a href=\"https://docs.microsoft.com/en-us/iis/install/installing-iis-85/installing-iis-85-on-windows-server-2012-r2\" >Learn more</a>\n            </p>\n        </div>\n        <div *ngIf=\"!appPool && _service.installStatus != 'stopped'\">\n            <button [class.background-active]=\"newWebSite.opened\" (click)=\"newWebSite.toggle()\">Create Web Site <i class=\"fa fa-caret-down\"></i></button>\n            <selector #newWebSite class=\"container-fluid\">\n                <new-website (created)=\"newWebSite.close()\" (cancel)=\"newWebSite.close()\"></new-website>\n            </selector>\n        </div>\n        <br/>\n        <website-list *ngIf=\"_sites\" [model]=\"_sites\" [fields]=\"fields()\"></website-list>\n    ",
            styles: ["\n        br {\n            margin-top: 30px;\n        }\n\n        .not-installed {\n            text-align: center;\n            margin-top: 50px;\n        }\n    "]
        }),
        __param(0, core_1.Inject("WebSitesService")),
        __metadata("design:paramtypes", [websites_service_1.WebSitesService])
    ], WebSiteListComponent);
    return WebSiteListComponent;
}());
exports.WebSiteListComponent = WebSiteListComponent;
//# sourceMappingURL=website-list.component.js.map