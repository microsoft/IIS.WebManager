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
var ip_restrictions_service_1 = require("./ip-restrictions.service");
var notification_service_1 = require("../../notification/notification.service");
var IpRestrictionsComponent = /** @class */ (function () {
    function IpRestrictionsComponent(_service, _notificationService) {
        this._service = _service;
        this._notificationService = _notificationService;
        this.enabled = null;
        this._subscriptions = [];
    }
    IpRestrictionsComponent.prototype.ngOnInit = function () {
        var _this = this;
        this._subscriptions.push(this._service.ipRestrictions.subscribe(function (feature) { return _this.setFeature(feature); }));
        this._service.initialize(this.id);
    };
    IpRestrictionsComponent.prototype.ngOnDestroy = function () {
        this._subscriptions.forEach(function (sub) { return sub.unsubscribe(); });
    };
    IpRestrictionsComponent.prototype.onEnabledChanging = function (val) {
        var _this = this;
        if (!val) {
            this._notificationService.confirm("Disable IP Restrictions", "CAUTION: All rules will be deleted when IP Restrictions is turned off.")
                .then(function (confirmed) {
                if (confirmed) {
                    _this.ipRestrictions.enabled = false;
                    _this.enabled = false;
                    _this.onModelChanged();
                }
                else {
                    setTimeout(function () { return _this.enabled = true; }, 1); // Restore
                    _this.ipRestrictions.enabled = true;
                }
            });
        }
        else {
            this.enabled = true;
        }
    };
    IpRestrictionsComponent.prototype.onModelChanged = function () {
        var changes = diff_1.DiffUtil.diff(this._original, this.ipRestrictions);
        if (Object.keys(changes).length > 0) {
            this._service.updateFeature(changes);
        }
    };
    IpRestrictionsComponent.prototype.onRevert = function () {
        this._service.revert();
    };
    IpRestrictionsComponent.prototype.setFeature = function (feature) {
        if (feature) {
            this._locked = feature.metadata.is_locked ? true : null;
            if (feature.enabled == null) {
                feature.enabled = false;
            }
            if (this.enabled === null || feature.enabled) {
                this.enabled = feature.enabled;
            }
        }
        this.ipRestrictions = feature;
        this._original = JSON.parse(JSON.stringify(feature));
    };
    IpRestrictionsComponent.prototype.resetFeature = function () {
        this.ipRestrictions.deny_action = "Forbidden";
        this.ipRestrictions.enable_proxy_mode = false;
        this.ipRestrictions.enable_reverse_dns = false;
        this.ipRestrictions.allow_unlisted = true;
        this.ipRestrictions.deny_by_concurrent_requests.enabled = false;
        this.ipRestrictions.deny_by_request_rate.enabled = false;
        this.ipRestrictions.logging_only_mode = false;
        this.onModelChanged();
    };
    IpRestrictionsComponent.prototype.isPending = function () {
        return this._service.status == status_1.Status.Starting
            || this._service.status == status_1.Status.Stopping;
    };
    IpRestrictionsComponent.prototype.install = function (val) {
        var _this = this;
        if (val) {
            return this._service.install();
        }
        else {
            this._notificationService.confirm("Turn Off IP Restrictions", 'This will turn off "IP Restrictions" for the entire web server.')
                .then(function (confirmed) {
                if (confirmed) {
                    _this._service.uninstall();
                }
            });
        }
    };
    IpRestrictionsComponent = __decorate([
        core_1.Component({
            template: "\n        <loading *ngIf=\"_service.status == 'unknown' && !_service.error\"></loading>\n        <error [error]=\"_service.error\"></error>\n        <switch class=\"install\" *ngIf=\"_service.webserverScope && _service.status != 'unknown'\" #s\n                [auto]=\"false\"\n                [model]=\"_service.status == 'started' || _service.status == 'starting'\" \n                [disabled]=\"_service.status == 'starting' || _service.status == 'stopping'\"\n                (modelChanged)=\"install(!s.model)\">\n                    <span *ngIf=\"!isPending()\">{{s.model ? \"On\" : \"Off\"}}</span>\n                    <span *ngIf=\"isPending()\" class=\"loading\"></span>\n        </switch>\n        <span *ngIf=\"_service.status == 'stopped' && !_service.webserverScope\">IP Restrictions are off. Turn them on <a [routerLink]=\"['/webserver/ip-restrictions']\">here</a></span>\n        <override-mode class=\"pull-right\" *ngIf=\"ipRestrictions\" [scope]=\"ipRestrictions.scope\" [metadata]=\"ipRestrictions.metadata\" (revert)=\"onRevert()\" (modelChanged)=\"onModelChanged()\"></override-mode>\n        <div *ngIf=\"ipRestrictions\" [attr.disabled]=\"_locked || null\">\n            <fieldset>\n                <label *ngIf=\"!ipRestrictions.scope\">Web Site Default</label>\n                <switch class=\"block\" [(model)]=\"enabled\" #s [auto]=\"false\" (modelChanged)=\"onEnabledChanging(!s.model)\">{{enabled ? \"On\" : \"Off\"}}</switch>\n            </fieldset>\n            <div *ngIf=\"enabled || !ipRestrictions.scope\">\n                <tabs>\n                    <tab [name]=\"'General'\">\n                            <ip-addresses [model]=\"ipRestrictions\" (modelChanged)=\"onModelChanged()\"></ip-addresses>\n                            <dynamic-restrictions *ngIf=\"ipRestrictions && ipRestrictions.deny_by_request_rate\" [model]=\"ipRestrictions\" (modelChange)=\"onModelChanged()\"></dynamic-restrictions>\n                    </tab>\n                    <tab [name]=\"'IP/Domain Rules'\">\n                            <restriction-rules [ipRestrictions]=\"ipRestrictions\" (modelChange)=\"onModelChanged()\"></restriction-rules>\n                    </tab>\n                </tabs>\n            </div>            \n        </div>\n    ",
            styles: ["\n        select.path{\n            max-width: 400px;\n            width: 100%;\n        }\n\n        tabs {\n            margin-top: 10px;\n            display: block;\n        }\n\n        fieldset:last-of-type {\n            margin-bottom: 30px;\n        }\n    "]
        }),
        __metadata("design:paramtypes", [ip_restrictions_service_1.IpRestrictionsService,
            notification_service_1.NotificationService])
    ], IpRestrictionsComponent);
    return IpRestrictionsComponent;
}());
exports.IpRestrictionsComponent = IpRestrictionsComponent;
//# sourceMappingURL=ip-restrictions.component.js.map