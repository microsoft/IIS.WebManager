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
var static_content_service_1 = require("../static-content/static-content.service");
var MimeMapsComponent = /** @class */ (function () {
    function MimeMapsComponent(_service) {
        this._service = _service;
        this._subscriptions = [];
    }
    MimeMapsComponent.prototype.ngOnInit = function () {
        var _this = this;
        this._subscriptions.push(this._service.staticContent.subscribe(function (feature) { return _this.setFeature(feature); }));
        this._service.initialize(this.id);
    };
    MimeMapsComponent.prototype.ngOnDestroy = function () {
        this._subscriptions.forEach(function (sub) { return sub.unsubscribe(); });
    };
    MimeMapsComponent.prototype.onModelChanged = function () {
        var changes = diff_1.DiffUtil.diff(this._original, this.staticContent);
        if (Object.keys(changes).length == 0) {
            return;
        }
        this._service.update(changes);
    };
    MimeMapsComponent.prototype.onRevert = function () {
        this._service.revert();
    };
    MimeMapsComponent.prototype.setFeature = function (feature) {
        if (feature) {
            this._locked = feature.is_locked;
        }
        this.staticContent = feature;
        this._original = JSON.parse(JSON.stringify(feature));
    };
    MimeMapsComponent = __decorate([
        core_1.Component({
            template: "\n        <loading *ngIf=\"_service.status == 'unknown' && !_service.error\"></loading>\n        <error [error]=\"_service.error\"></error>\n        <span *ngIf=\"_service.status == 'stopped'\">Mime Maps are off. Turn them on <a [routerLink]=\"['/webserver/static-content']\">here</a></span>\n        <override-mode class=\"pull-right\" *ngIf=\"staticContent\" [scope]=\"staticContent.scope\" [metadata]=\"staticContent.metadata\" (revert)=\"onRevert()\" (modelChanged)=\"onModelChanged()\"></override-mode>\n        <div *ngIf=\"staticContent\">\n            <mime-maps (modelChanged)=\"onSave($event)\" (delete)=\"onDelete($event)\" (add)=\"onAdd($event)\"><mime-maps>\n        <div>\n    "
        }),
        __metadata("design:paramtypes", [static_content_service_1.StaticContentService])
    ], MimeMapsComponent);
    return MimeMapsComponent;
}());
exports.MimeMapsComponent = MimeMapsComponent;
//# sourceMappingURL=mime-maps.component.js.map