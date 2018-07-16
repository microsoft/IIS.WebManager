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
var diff_1 = require("../../utils/diff");
var authentication_service_1 = require("./authentication.service");
var AnonymousAuthenticationComponent = /** @class */ (function () {
    function AnonymousAuthenticationComponent(_service) {
        var _this = this;
        this._service = _service;
        this._subscriptions = [];
        this._subscriptions.push(this._service.anonAuth.subscribe(function (auth) {
            _this.setFeature(auth);
        }));
    }
    AnonymousAuthenticationComponent.prototype.ngOnDestroy = function () {
        this._subscriptions.forEach(function (sub) { return sub.unsubscribe(); });
    };
    AnonymousAuthenticationComponent.prototype.onModelChanged = function () {
        if (this._model.metadata.is_locked) {
            this.resetModel();
        }
        var changes = diff_1.DiffUtil.diff(this._original, this._model);
        if (Object.keys(changes).length > 0) {
            this._service.update(this._model, changes);
        }
    };
    AnonymousAuthenticationComponent.prototype.onRevert = function () {
        this._service.revert(this._model);
    };
    AnonymousAuthenticationComponent.prototype.setFeature = function (feature) {
        if (feature) {
            feature.password = "";
            this._locked = feature.metadata.is_locked ? true : null;
        }
        this._model = feature;
        this._original = JSON.parse(JSON.stringify(feature));
    };
    AnonymousAuthenticationComponent.prototype.resetModel = function () {
        for (var k in this._original) {
            this._model[k] = JSON.parse(JSON.stringify(this._original[k] || null));
        }
        this._model.password = "";
    };
    AnonymousAuthenticationComponent = __decorate([
        core_1.Component({
            selector: 'anon-auth',
            template: "\n        <error [error]=\"_service.anonymousError\"></error>\n        <div *ngIf=\"_model\">\n            <override-mode class=\"pull-right\" [metadata]=\"_model.metadata\" (revert)=\"onRevert()\" (modelChanged)=\"onModelChanged()\"></override-mode>\n            <fieldset>\n                <label *ngIf=\"!_model.scope\">Web Site Default</label>\n                <switch class=\"block\" [disabled]=\"_locked\" [(model)]=\"_model.enabled\" (modelChanged)=\"onModelChanged()\">{{_model.enabled ? \"On\" : \"Off\"}}</switch>\n            </fieldset>\n            <div class=\"clear\" *ngIf=\"_model.enabled || !_model.scope\">\n                <fieldset>\n                    <label>User</label>\n                    <input class=\"form-control path\" type=\"text\" [disabled]=\"_locked\" [(ngModel)]=\"_model.user\" throttle (modelChanged)=\"onModelChanged()\" />\n                </fieldset>\n                <fieldset>\n                    <label>Password</label>\n                    <input class=\"form-control path\" type=\"text\" [disabled]=\"_locked\" [(ngModel)]=\"_model.password\" throttle (modelChanged)=\"onModelChanged()\" />\n                </fieldset>  \n            </div>  \n        </div>\n    "
        }),
        __metadata("design:paramtypes", [authentication_service_1.AuthenticationService])
    ], AnonymousAuthenticationComponent);
    return AnonymousAuthenticationComponent;
}());
exports.AnonymousAuthenticationComponent = AnonymousAuthenticationComponent;
//# sourceMappingURL=anon-auth.component.js.map