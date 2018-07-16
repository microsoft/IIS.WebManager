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
var selector_1 = require("../../common/selector");
var webapp_1 = require("./webapp");
var webapps_service_1 = require("./webapps.service");
var site_1 = require("../websites/site");
var app_pool_list_component_1 = require("../app-pools/app-pool-list.component");
var NewWebAppComponent = /** @class */ (function () {
    function NewWebAppComponent(_service) {
        this._service = _service;
        this.created = new core_1.EventEmitter();
        this.cancel = new core_1.EventEmitter();
        this._customPool = false;
    }
    NewWebAppComponent.prototype.ngOnInit = function () {
        this.reset();
    };
    NewWebAppComponent.prototype.onSave = function () {
        var _this = this;
        this._service.create(this.model)
            .then(function (app) {
            _this.reset();
            _this.created.emit(app);
        });
    };
    NewWebAppComponent.prototype.onCancel = function () {
        this.reset();
        this.cancel.emit(null);
    };
    NewWebAppComponent.prototype.onNewAppPool = function (value) {
        if (!value) {
            this.model.application_pool = this.website.application_pool;
        }
    };
    NewWebAppComponent.prototype.IsValid = function () {
        return !(!this.model.path || !this.model.physical_path);
    };
    NewWebAppComponent.prototype.reset = function () {
        var app = new webapp_1.WebApp();
        app.path = "";
        app.physical_path = "";
        app.website = this.website;
        app.application_pool = this.website.application_pool;
        this.model = app;
    };
    NewWebAppComponent.prototype.selectAppPool = function () {
        this.poolSelect.toggle();
        if (this.poolSelect.opened) {
            this.appPools.activate();
        }
    };
    NewWebAppComponent.prototype.onAppPoolSelected = function (pool) {
        this.poolSelect.close();
        if (this.model.application_pool && this.model.application_pool.id == pool.id) {
            return;
        }
        this.model.application_pool = pool;
    };
    NewWebAppComponent.prototype.onSelectPath = function (event) {
        if (event.length == 1) {
            this.model.physical_path = event[0].physical_path;
        }
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", site_1.WebSite)
    ], NewWebAppComponent.prototype, "website", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], NewWebAppComponent.prototype, "created", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], NewWebAppComponent.prototype, "cancel", void 0);
    __decorate([
        core_1.ViewChild('poolSelect'),
        __metadata("design:type", selector_1.Selector)
    ], NewWebAppComponent.prototype, "poolSelect", void 0);
    __decorate([
        core_1.ViewChild('appPools'),
        __metadata("design:type", app_pool_list_component_1.AppPoolListComponent)
    ], NewWebAppComponent.prototype, "appPools", void 0);
    NewWebAppComponent = __decorate([
        core_1.Component({
            selector: 'new-webapp',
            template: "\n        <tabs>\n            <tab [name]=\"'Settings'\">\n                <fieldset>\n                    <label>Path</label>\n                    <input type=\"text\" class=\"form-control path\" [(ngModel)]=\"model.path\" required />\n                </fieldset>\n                <fieldset class=\"path\">\n                    <label>Physical Path</label>\n                    <button [class.background-active]=\"fileSelector.isOpen()\" title=\"Select Folder\" class=\"right select\" (click)=\"fileSelector.toggle()\"></button>\n                    <div class=\"fill\">\n                        <input type=\"text\" class=\"form-control\" [(ngModel)]=\"model.physical_path\" required />\n                    </div>\n                    <server-file-selector #fileSelector [types]=\"['directory']\" [defaultPath]=\"model.physical_path\" (selected)=\"onSelectPath($event)\"></server-file-selector>\n                </fieldset>\n            </tab>\n            <tab [name]=\"'Application Pool'\">\n                <fieldset>\n                    <label>Use Custom Application Pool</label>\n                    <switch class=\"block\" [(model)]=\"_customPool\" (modelChange)=\"onNewAppPool($event)\">{{_customPool ? \"Yes\" : \"No\"}}</switch>\n                </fieldset>\n                <div class=\"app-pool\" *ngIf=\"_customPool\">\n                    <button [class.background-active]=\"poolSelect.opened\" (click)=\"selectAppPool()\">{{!model.application_pool ? \"Choose Application Pool\" : \"Change Application Pool\" }} <i class=\"fa fa-caret-down\"></i></button>\n                    <selector #poolSelect class=\"container-fluid create\">\n                        <app-pools #appPools [actions]=\"'view'\" [lazy]=\"true\" (itemSelected)=\"onAppPoolSelected($event)\"></app-pools>\n                    </selector>\n                    <fieldset>\n                        <app-pool-details *ngIf=\"model.application_pool\" [model]=\"model.application_pool\"></app-pool-details>\n                    </fieldset>\n                </div>\n            </tab>\n        </tabs>\n        <p class=\"pull-right\">\n            <button (click)=\"onSave()\" [disabled]=\"!IsValid()\">\n                <i title=\"Create\" class=\"fa fa-check color-active\"></i> Create\n            </button>\n            <button (click)=\"onCancel()\">\n                <i class=\"fa fa-times red\"></i> Cancel\n            </button>\n        </p>\n    ",
            styles: ["\n        h2 {\n            margin-top: 32px;\n            margin-bottom: 18px;\n        }\n\n        ul {\n            margin-bottom: 32px;\n        }\n    "]
        }),
        __param(0, core_1.Inject("WebAppsService")),
        __metadata("design:paramtypes", [webapps_service_1.WebAppsService])
    ], NewWebAppComponent);
    return NewWebAppComponent;
}());
exports.NewWebAppComponent = NewWebAppComponent;
//# sourceMappingURL=new-webapp.component.js.map