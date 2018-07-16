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
var IdentityComponent = /** @class */ (function () {
    function IdentityComponent() {
        this.useUserProfile = true;
        this.modelChanged = new core_1.EventEmitter();
    }
    IdentityComponent.prototype.onModelChanged = function () {
        this.modelChanged.emit(null);
    };
    IdentityComponent.prototype.onConfirmPassword = function (value) {
        if (value == this._password) {
            this.model.password = value;
        }
        this.onModelChanged();
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", app_pool_1.ApplicationPoolIdentity)
    ], IdentityComponent.prototype, "model", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], IdentityComponent.prototype, "useUserProfile", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], IdentityComponent.prototype, "modelChanged", void 0);
    IdentityComponent = __decorate([
        core_1.Component({
            selector: 'identity',
            template: "\n        <fieldset class='inline-block'>\n            <label>Identity</label>\n            <select class=\"form-control\" [(ngModel)]=\"model.identity_type\" (modelChanged)=\"onModelChanged()\">\n                <option value=\"ApplicationPoolIdentity\">Application Pool Identity</option>\n                <option value=\"LocalSystem\">Local System</option>\n                <option value=\"LocalService\">Local Service</option>\n                <option value=\"NetworkService\">Network Service</option>\n                <option value=\"SpecificUser\">Custom</option>\n            </select>\n        </fieldset>\n        <div *ngIf=\"model.identity_type == 'SpecificUser'\" class='inline-block'>\n            <fieldset class='inline-block'>\n                <label>Username</label>\n                <input class=\"form-control\" type=\"text\" [(ngModel)]=\"model.username\" throttle (modelChanged)=\"onModelChanged()\" />\n            </fieldset>\n            <div class='inline-block'>\n                <fieldset class='inline-block'>\n                    <label>Password</label>\n                    <input class=\"form-control\" type=\"password\" [(ngModel)]=\"_password\" (modelChanged)=\"onModelChanged()\" />\n                </fieldset>\n                <fieldset *ngIf=\"!!(_password)\" class='inline-block'>\n                    <label>Confirm Password</label>\n                    <input class=\"form-control\" type=\"password\" ngModel (ngModelChange)=\"onConfirmPassword($event)\" [validateEqual]=\"_password\" />\n                </fieldset>\n            </div>\n        </div>\n        <fieldset class='inline-block' *ngIf=\"useUserProfile\">\n            <label>Load User Profile</label>\n            <switch class=\"block\" [(model)]=\"model.load_user_profile\" (modelChanged)=\"onModelChanged()\">\n                {{model.load_user_profile ? \"On\" : \"Off\"}}\n            </switch>\n        </fieldset>\n    "
        })
    ], IdentityComponent);
    return IdentityComponent;
}());
exports.IdentityComponent = IdentityComponent;
//# sourceMappingURL=identity.component.js.map