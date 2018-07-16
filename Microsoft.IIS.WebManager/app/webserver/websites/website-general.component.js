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
var forms_1 = require("@angular/forms");
var selector_1 = require("../../common/selector");
var site_1 = require("./site");
var app_pool_list_component_1 = require("../app-pools/app-pool-list.component");
var WebSiteGeneralComponent = /** @class */ (function () {
    function WebSiteGeneralComponent() {
        this.modelChanged = new core_1.EventEmitter();
    }
    WebSiteGeneralComponent.prototype.ngOnInit = function () {
        this.custom_protocols = !(this.site.enabled_protocols.toLowerCase() == "http" ||
            this.site.enabled_protocols.toLowerCase() == "https");
    };
    WebSiteGeneralComponent.prototype.onModelChanged = function () {
        if (this.isValid()) {
            // Bubble up model changed event to parent
            this.modelChanged.emit(null);
        }
    };
    WebSiteGeneralComponent.prototype.isValid = function () {
        // Check all validators provided by ngModel
        if (this.validators) {
            var vs = this.validators.toArray();
            for (var _i = 0, vs_1 = vs; _i < vs_1.length; _i++) {
                var control = vs_1[_i];
                if (!control.valid) {
                    return false;
                }
            }
        }
        return true;
    };
    WebSiteGeneralComponent.prototype.selectAppPool = function () {
        this.poolSelect.toggle();
        if (this.poolSelect.opened) {
            this.appPools.activate();
        }
    };
    WebSiteGeneralComponent.prototype.onAppPoolSelected = function (pool) {
        this.poolSelect.close();
        if (this.site.application_pool && this.site.application_pool.id == pool.id) {
            return;
        }
        this.site.application_pool = pool;
        this.onModelChanged();
    };
    WebSiteGeneralComponent.prototype.useCustomProtocols = function (value) {
        if (!value) {
            this.site.enabled_protocols = "http";
            this.onModelChanged();
        }
    };
    WebSiteGeneralComponent.prototype.onSelectPath = function (event) {
        if (event.length == 1) {
            this.site.physical_path = event[0].physical_path;
            this.onModelChanged();
        }
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", site_1.WebSite)
    ], WebSiteGeneralComponent.prototype, "site", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], WebSiteGeneralComponent.prototype, "modelChanged", void 0);
    __decorate([
        core_1.ViewChild('poolSelect'),
        __metadata("design:type", selector_1.Selector)
    ], WebSiteGeneralComponent.prototype, "poolSelect", void 0);
    __decorate([
        core_1.ViewChild('appPools'),
        __metadata("design:type", app_pool_list_component_1.AppPoolListComponent)
    ], WebSiteGeneralComponent.prototype, "appPools", void 0);
    __decorate([
        core_1.ViewChildren(forms_1.NgModel),
        __metadata("design:type", core_1.QueryList)
    ], WebSiteGeneralComponent.prototype, "validators", void 0);
    WebSiteGeneralComponent = __decorate([
        core_1.Component({
            selector: 'website-general',
            template: "\n        <tabs>\n            <tab [name]=\"'Settings'\">\n                <fieldset>\n                    <label>Name</label>\n                    <input class=\"form-control name\" type=\"text\" [(ngModel)]=\"site.name\" throttle (modelChanged)=\"onModelChanged()\" required/>\n                </fieldset>\n                <fieldset class=\"path\">\n                    <label>Physical Path</label>\n                    <button title=\"Select Folder\" [class.background-active]=\"fileSelector.isOpen()\" class=\"right select\" (click)=\"fileSelector.toggle()\"></button>\n                    <div class=\"fill\">\n                        <input type=\"text\" class=\"form-control\" [(ngModel)]=\"site.physical_path\" (modelChanged)=\"onModelChanged()\" throttle required />\n                    </div>\n                    <server-file-selector #fileSelector [types]=\"['directory']\" [defaultPath]=\"site.physical_path\" (selected)=\"onSelectPath($event)\"></server-file-selector>\n                </fieldset>\n                <fieldset>\n                    <label>Auto Start</label>\n                    <switch class=\"block\" [(model)]=\"site.server_auto_start\" (modelChanged)=\"onModelChanged()\">{{site.server_auto_start ? \"On\" : \"Off\"}}</switch>\n                </fieldset>\n                <fieldset class=\"inline-block\">\n                    <label>Custom Protocols</label>\n                    <switch class=\"block\" [(model)]=\"custom_protocols\" (modelChange)=\"useCustomProtocols($event)\">{{custom_protocols ? \"On\" : \"Off\"}}</switch>\n                </fieldset>\n                <fieldset class=\"inline-block\" *ngIf=\"custom_protocols\">\n                    <label>Protocols</label>\n                    <input class=\"form-control\" type=\"text\" [(ngModel)]=\"site.enabled_protocols\" (modelChanged)=\"onModelChanged()\" required throttle />\n                </fieldset>\n            </tab>\n            <tab [name]=\"'Bindings'\">\n                <binding-list *ngIf=\"site.bindings\" [(model)]=\"site.bindings\" (modelChange)=\"onModelChanged()\"></binding-list>\n            </tab>\n            <tab [name]=\"'Limits'\">\n                <limits [model]=\"site.limits\" (modelChanged)=\"onModelChanged()\"></limits>\n            </tab>\n            <tab [name]=\"'Application Pool'\">\n                <button [class.background-active]=\"poolSelect.opened\" (click)=\"selectAppPool()\">Change Application Pool <i class=\"fa fa-caret-down\"></i></button>\n                <selector #poolSelect class=\"container-fluid create\">\n                    <app-pools #appPools [actions]=\"'view'\" [lazy]=\"true\" (itemSelected)=\"onAppPoolSelected($event)\"></app-pools>\n                </selector>\n                <app-pool-details [model]=\"site.application_pool\"></app-pool-details>\n            </tab>\n        </tabs>\n    "
        })
    ], WebSiteGeneralComponent);
    return WebSiteGeneralComponent;
}());
exports.WebSiteGeneralComponent = WebSiteGeneralComponent;
//# sourceMappingURL=website-general.component.js.map