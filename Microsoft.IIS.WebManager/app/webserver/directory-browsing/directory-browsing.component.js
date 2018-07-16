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
var directory_browsing_service_1 = require("./directory-browsing.service");
var notification_service_1 = require("../../notification/notification.service");
var DirectoryBrowsingComponent = /** @class */ (function () {
    function DirectoryBrowsingComponent(_service, _notificationService) {
        this._service = _service;
        this._notificationService = _notificationService;
        this._subscriptions = [];
    }
    DirectoryBrowsingComponent.prototype.ngOnInit = function () {
        var _this = this;
        this._subscriptions.push(this._service.directoryBrowsing.subscribe(function (feature) {
            _this.setFeature(feature);
        }));
        this._service.init(this.id);
    };
    DirectoryBrowsingComponent.prototype.ngOnDestroy = function () {
        this._subscriptions.forEach(function (sub) { return sub.unsubscribe(); });
    };
    DirectoryBrowsingComponent.prototype.onModelChanged = function () {
        var changes = diff_1.DiffUtil.diff(this._original, this.feature);
        if (Object.keys(changes).length > 0) {
            this._service.update(changes);
        }
    };
    DirectoryBrowsingComponent.prototype.onRevert = function () {
        this._service.revert();
    };
    DirectoryBrowsingComponent.prototype.setFeature = function (feature) {
        if (feature) {
            this._locked = feature.metadata.is_locked ? true : null;
        }
        this.feature = feature;
        this._original = JSON.parse(JSON.stringify(feature));
    };
    DirectoryBrowsingComponent.prototype.isPending = function () {
        return this._service.status == status_1.Status.Starting
            || this._service.status == status_1.Status.Stopping;
    };
    DirectoryBrowsingComponent.prototype.install = function (val) {
        var _this = this;
        if (val) {
            return this._service.install();
        }
        else {
            this._notificationService.confirm("Turn Off Directory Browsing", 'This will turn off "Directory Browsing" for the entire web server.')
                .then(function (confirmed) {
                if (confirmed) {
                    _this._service.uninstall();
                }
            });
        }
    };
    DirectoryBrowsingComponent = __decorate([
        core_1.Component({
            template: "\n        <loading *ngIf=\"_service.status == 'unknown' && !_service.error\"></loading>\n        <error [error]=\"_service.error\"></error>\n        <switch class=\"install\" *ngIf=\"_service.webserverScope && _service.status != 'unknown'\" #s\n                [auto]=\"false\"\n                [model]=\"_service.status == 'started' || _service.status == 'starting'\" \n                [disabled]=\"_service.status == 'starting' || _service.status == 'stopping'\"\n                (modelChanged)=\"install(!s.model)\">\n                    <span *ngIf=\"!isPending()\">{{s.model ? \"On\" : \"Off\"}}</span>\n                    <span *ngIf=\"isPending()\" class=\"loading\"></span>\n        </switch>\n        <span *ngIf=\"_service.status == 'stopped' && !_service.webserverScope\">Directory Browsing is off. Turn it on <a [routerLink]=\"['/webserver/directory-browsing']\">here</a></span>\n        <override-mode class=\"pull-right\" *ngIf=\"feature\" [scope]=\"feature.scope\" [metadata]=\"feature.metadata\" (revert)=\"onRevert()\" (modelChanged)=\"onModelChanged()\"></override-mode>\n        <div *ngIf=\"feature\">\n            <fieldset>\n                <label *ngIf=\"!feature.scope\">Web Site Default</label>\n                <switch class=\"block\" [disabled]=\"_locked\" [(model)]=\"feature.enabled\" (modelChanged)=\"onModelChanged()\">{{feature.enabled ? \"On\" : \"Off\"}}</switch>\n            </fieldset>\n            <div [hidden]=\"!feature.enabled && feature.scope\">\n                <fieldset>\n                    <label>Directory Attributes</label>\n                    <ul class=\"allowed-attributes\">\n                        <li class=\"checkbox\">\n                            <checkbox2 [disabled]=\"_locked\" [(model)]=\"feature.allowed_attributes.date\" (modelChanged)=\"onModelChanged()\">Date</checkbox2>\n                        </li>\n                        <li class=\"checkbox\">\n                            <checkbox2 [disabled]=\"_locked\" [(model)]=\"feature.allowed_attributes.time\" (modelChanged)=\"onModelChanged()\">Time</checkbox2>\n                        </li>\n                        <li class=\"checkbox\">\n                            <checkbox2 [disabled]=\"_locked\" [(model)]=\"feature.allowed_attributes.size\" (modelChanged)=\"onModelChanged()\">Size</checkbox2>\n                        </li>\n                        <li class=\"checkbox\">\n                            <checkbox2 [disabled]=\"_locked\" [(model)]=\"feature.allowed_attributes.extension\" (modelChanged)=\"onModelChanged()\">Extension</checkbox2>\n                        </li>\n                        <li class=\"checkbox\">\n                            <checkbox2 [disabled]=\"_locked\" [(model)]=\"feature.allowed_attributes.long_date\" (modelChanged)=\"onModelChanged()\">Long Date</checkbox2>\n                        </li>\n                    </ul>\n                </fieldset>\n            </div>\n        </div>\n    ",
            styles: ["\n        .allowed-attributes li {\n            padding:10px;\n            padding-left: 0px;\n            position:relative;\n        }\n    "]
        }),
        __metadata("design:paramtypes", [directory_browsing_service_1.DirectoryBrowsingService,
            notification_service_1.NotificationService])
    ], DirectoryBrowsingComponent);
    return DirectoryBrowsingComponent;
}());
exports.DirectoryBrowsingComponent = DirectoryBrowsingComponent;
//# sourceMappingURL=directory-browsing.component.js.map