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
var app_pool_1 = require("./app-pool");
var RapidFailProtectionComponent = /** @class */ (function () {
    function RapidFailProtectionComponent() {
        this.modelChanged = new core_1.EventEmitter();
    }
    RapidFailProtectionComponent.prototype.onModelChanged = function () {
        this.modelChanged.emit(null);
    };
    RapidFailProtectionComponent.prototype.onAutoShutdownExe = function (value) {
        if (!value) {
            this.model.auto_shutdown_exe = "";
            this.model.auto_shutdown_params = "";
        }
        else {
            this.model.auto_shutdown_exe = " ";
            this.model.auto_shutdown_params = " ";
        }
        this.onModelChanged();
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", app_pool_1.RapidFailProtection)
    ], RapidFailProtectionComponent.prototype, "model", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], RapidFailProtectionComponent.prototype, "modelChanged", void 0);
    RapidFailProtectionComponent = __decorate([
        core_1.Component({
            selector: 'rapid-fail-protection',
            template: "            \n        <div>\n            <fieldset>\n                <switch class=\"block\" [(model)]=\"model.enabled\" (modelChanged)=\"onModelChanged()\">\n                    {{model.enabled ? \"On\" : \"Off\"}}\n                </switch>\n            </fieldset>\n        </div>\n        <div *ngIf=\"model.enabled\">\n            <fieldset class='inline-block'>\n                <label>Max Crashes</label>\n                <input class=\"form-control\" type=\"number\" [(ngModel)]=\"model.max_crashes\" throttle (modelChanged)=\"onModelChanged()\" />\n            </fieldset>\n            <fieldset class='inline-block'>\n                <label>Reset After <span class=\"units\">(min)</span></label>\n                <input class=\"form-control\" type=\"number\" [(ngModel)]=\"model.interval\" throttle (modelChanged)=\"onModelChanged()\" />\n            </fieldset>\n            <fieldset>\n                <label>Response Action</label>\n                <enum [(model)]=\"model.load_balancer_capabilities\" (modelChanged)=\"onModelChanged()\">\n                    <field name=\"Service Unavailable\" value=\"HttpLevel\"></field>\n                    <field name=\"Reset Connection\" value=\"TcpLevel\"></field>\n                </enum>\n            </fieldset>\n            <fieldset>\n                <label>Shutdown Action</label>\n                <switch class=\"block\" [model]=\"model.auto_shutdown_exe\" (modelChange)=\"onAutoShutdownExe($event)\">\n                    {{model.auto_shutdown_exe ? \"On\" : \"Off\"}}\n                </switch>\n            </fieldset>\n            <div *ngIf='model.auto_shutdown_exe'>\n                <fieldset>\n                    <label>Action Path</label>\n                    <input class=\"form-control path\" type=\"text\" [(ngModel)]=\"model.auto_shutdown_exe\" throttle (modelChanged)=\"onModelChanged()\" />\n                </fieldset>\n                <fieldset>\n                    <label>Action Parameters</label>\n                    <input class=\"form-control path\" type=\"text\" [(ngModel)]=\"model.auto_shutdown_params\" throttle (modelChanged)=\"onModelChanged()\" />\n                </fieldset>\n            </div>\n        </div>\n    "
        })
    ], RapidFailProtectionComponent);
    return RapidFailProtectionComponent;
}());
exports.RapidFailProtectionComponent = RapidFailProtectionComponent;
//# sourceMappingURL=rapid-fail-protection.component.js.map