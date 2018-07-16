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
var status_1 = require("../../common/status");
var static_content_service_1 = require("./static-content.service");
var notification_service_1 = require("../../notification/notification.service");
var StaticContentComponent = /** @class */ (function () {
    function StaticContentComponent(_service, _notificationService) {
        this._service = _service;
        this._notificationService = _notificationService;
        this._subscriptions = [];
    }
    StaticContentComponent.prototype.ngOnInit = function () {
        var _this = this;
        this._subscriptions.push(this._service.staticContent.subscribe(function (feature) { return _this.setFeature(feature); }));
        this._service.initialize(this.id);
    };
    StaticContentComponent.prototype.ngOnDestroy = function () {
        this._subscriptions.forEach(function (sub) { return sub.unsubscribe(); });
    };
    StaticContentComponent.prototype.onModelChanged = function () {
        var changes = diff_1.DiffUtil.diff(this._original, this.staticContent);
        if (Object.keys(changes).length == 0) {
            return;
        }
        if (changes.client_cache.control_mode && changes.client_cache.control_mode == 'use_expires') {
            changes.client_cache.http_expires = this.staticContent.client_cache.http_expires;
        }
        this._service.update(changes);
    };
    StaticContentComponent.prototype.onRevert = function () {
        this._service.revert();
    };
    StaticContentComponent.prototype.setFeature = function (feature) {
        if (feature) {
            this._locked = feature.metadata.is_locked;
        }
        this.staticContent = feature;
        this._original = JSON.parse(JSON.stringify(feature));
    };
    StaticContentComponent.prototype.isPending = function () {
        return this._service.status == status_1.Status.Starting
            || this._service.status == status_1.Status.Stopping;
    };
    StaticContentComponent.prototype.install = function (val) {
        var _this = this;
        if (val) {
            return this._service.install();
        }
        else {
            this._notificationService.confirm("Turn Off Static Content", 'This will turn off "Static Content" for the entire web server.')
                .then(function (result) {
                if (result) {
                    _this._service.uninstall();
                }
            });
        }
    };
    StaticContentComponent = __decorate([
        core_1.Component({
            template: "\n        <loading *ngIf=\"_service.status == 'unknown' && !_service.error\"></loading>\n        <error [error]=\"_service.error\"></error>\n        <override-mode class=\"pull-right\" *ngIf=\"staticContent\" [scope]=\"staticContent.scope\" [metadata]=\"staticContent.metadata\" (revert)=\"onRevert()\" (modelChanged)=\"onModelChanged()\"></override-mode>\n        <switch class=\"install\" *ngIf=\"_service.webserverScope && _service.status != 'unknown'\" #s\n                [auto]=\"false\"\n                [model]=\"_service.status == 'started' || _service.status == 'starting'\" \n                [disabled]=\"_service.status == 'starting' || _service.status == 'stopping'\"\n                (modelChanged)=\"install(!s.model)\">\n                    <span *ngIf=\"!isPending()\">{{s.model ? \"On\" : \"Off\"}}</span>\n                    <span *ngIf=\"isPending()\" class=\"loading\"></span>\n        </switch>\n        <span *ngIf=\"_service.status == 'stopped' && !_service.webserverScope\">Static Content is off. Turn it on <a [routerLink]=\"['/webserver/static-content']\">here</a></span>\n        <div *ngIf=\"staticContent\">\n            <client-cache [model]=\"staticContent.client_cache\" [locked]=\"_locked\" (modelChange)=\"onModelChanged()\"></client-cache>\n        </div>\n    "
        }),
        __metadata("design:paramtypes", [static_content_service_1.StaticContentService,
            notification_service_1.NotificationService])
    ], StaticContentComponent);
    return StaticContentComponent;
}());
exports.StaticContentComponent = StaticContentComponent;
//# sourceMappingURL=static-content.component.js.map