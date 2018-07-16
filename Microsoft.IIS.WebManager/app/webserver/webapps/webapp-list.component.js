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
var webapps_service_1 = require("./webapps.service");
var site_1 = require("../websites/site");
var app_pool_1 = require("../app-pools/app-pool");
var WebAppListComponent = /** @class */ (function () {
    function WebAppListComponent(_service) {
        this._service = _service;
    }
    WebAppListComponent.prototype.ngOnInit = function () {
        if (!this.lazy) {
            this.activate();
        }
    };
    WebAppListComponent.prototype.activate = function () {
        var _this = this;
        if (this._webapps) {
            return;
        }
        if (this.website) {
            //
            // Load by WebSite
            this._service.getBySite(this.website).then(function (_) {
                _this._service.webApps.subscribe(function (apps) {
                    _this._webapps = [];
                    apps.forEach(function (a) {
                        if (a.website.id == _this.website.id && a.path != '/') {
                            _this._webapps.push(a);
                        }
                    });
                });
            });
        }
        else if (this.appPool) {
            //
            // Load by AppPool
            this._service.getByAppPool(this.appPool).then(function (_) {
                _this._service.webApps.subscribe(function (apps) {
                    _this._webapps = [];
                    apps.forEach(function (a) {
                        if (a.application_pool && a.application_pool.id == _this.appPool.id && a.path != '/') {
                            _this._webapps.push(a);
                        }
                    });
                });
            });
        }
        else {
            this._webapps = [];
        }
    };
    WebAppListComponent.prototype.fields = function () {
        var fields = "path,site,app-pool";
        if (this.website) {
            fields = "path,app-pool";
        }
        else if (this.appPool) {
            fields = "path,site";
        }
        return fields;
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", app_pool_1.ApplicationPool)
    ], WebAppListComponent.prototype, "appPool", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", site_1.WebSite)
    ], WebAppListComponent.prototype, "website", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], WebAppListComponent.prototype, "lazy", void 0);
    WebAppListComponent = __decorate([
        core_1.Component({
            template: "\n        <div *ngIf=\"website\">\n            <button [class.background-active]=\"newWebApp.opened\" (click)=\"newWebApp.toggle()\">Create Web Application <i class=\"fa fa-caret-down\"></i></button>\n            <selector #newWebApp class=\"container-fluid\">\n                <new-webapp [website]=\"website\" (created)=\"newWebApp.close()\" (cancel)=\"newWebApp.close()\"></new-webapp>\n            </selector>\n        </div>\n        <br/>\n        <p *ngIf=\"!_webapps\">Loading...</p>\n        <webapp-list *ngIf=\"_webapps\" [model]=\"_webapps\" [fields]=\"fields()\"></webapp-list>\n    ",
            styles: ["\n        br {\n            margin-top: 30px;\n        }\n    "]
        }),
        __param(0, core_1.Inject("WebAppsService")),
        __metadata("design:paramtypes", [webapps_service_1.WebAppsService])
    ], WebAppListComponent);
    return WebAppListComponent;
}());
exports.WebAppListComponent = WebAppListComponent;
//# sourceMappingURL=webapp-list.component.js.map