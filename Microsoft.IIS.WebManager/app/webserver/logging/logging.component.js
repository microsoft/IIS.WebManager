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
var logging_service_1 = require("./logging.service");
var notification_service_1 = require("../../notification/notification.service");
var LoggingComponent = /** @class */ (function () {
    function LoggingComponent(_service, _notificationService) {
        this._service = _service;
        this._notificationService = _notificationService;
        this._subscriptions = [];
    }
    LoggingComponent.prototype.ngOnInit = function () {
        var _this = this;
        this._subscriptions.push(this._service.logging.subscribe(function (logging) { return _this.setFeature(logging); }));
        this._service.initialize(this.id);
    };
    LoggingComponent.prototype.ngOnDestroy = function () {
        this._subscriptions.forEach(function (sub) { return sub.unsubscribe(); });
    };
    LoggingComponent.prototype.onModelChanged = function () {
        if (!this.logging) {
            return;
        }
        // Set up diff object
        var changes = diff_1.DiffUtil.diff(this._original, this.logging);
        if (Object.keys(changes).length == 0) {
            return;
        }
        //
        // Update
        this._service.update(changes);
    };
    LoggingComponent.prototype.onRevert = function () {
        this._service.revert();
    };
    LoggingComponent.prototype.setFeature = function (logging) {
        this.logging = logging;
        this._original = JSON.parse(JSON.stringify(logging));
    };
    LoggingComponent.prototype.onSelectPath = function (target) {
        this.logging.directory = target[0].physical_path;
        this.onModelChanged();
    };
    LoggingComponent.prototype.isPending = function () {
        return this._service.status == status_1.Status.Starting
            || this._service.status == status_1.Status.Stopping;
    };
    LoggingComponent.prototype.install = function (val) {
        var _this = this;
        if (val) {
            return this._service.install();
        }
        else {
            this._notificationService.confirm("Turn Off Logging", 'This will turn off "Logging" for the entire web server.')
                .then(function (confirmed) {
                if (confirmed) {
                    _this._service.uninstall();
                }
            });
        }
    };
    LoggingComponent = __decorate([
        core_1.Component({
            template: "\n        <loading *ngIf=\"_service.status == 'unknown' && !_service.error\"></loading>\n        <error [error]=\"_service.error\"></error>\n        <switch class=\"install\" *ngIf=\"_service.webserverScope && _service.status != 'unknown'\" #s\n                [auto]=\"false\"\n                [model]=\"_service.status == 'started' || _service.status == 'starting'\" \n                [disabled]=\"_service.status == 'starting' || _service.status == 'stopping'\"\n                (modelChanged)=\"install(!s.model)\">\n                    <span *ngIf=\"!isPending()\">{{s.model ? \"On\" : \"Off\"}}</span>\n                    <span *ngIf=\"isPending()\" class=\"loading\"></span>\n        </switch>\n        <span *ngIf=\"_service.status == 'stopped' && !_service.webserverScope\">Logging is off. Turn it on <a [routerLink]=\"['/webserver/logging']\">here</a></span>\n        <override-mode class=\"pull-right\" *ngIf=\"logging\" [scope]=\"logging.scope\" [metadata]=\"logging.metadata\" (revert)=\"onRevert()\" (modelChanged)=\"onModelChanged()\"></override-mode>\n        <div *ngIf=\"logging\">\n            <fieldset class=\"collect\">\n                <label>Collect Logs</label>\n                <switch class=\"block\" [(model)]=\"logging.enabled\" (modelChanged)=\"onModelChanged()\">{{logging.enabled ? \"On\" : \"Off\"}}</switch>\n            </fieldset>\n            <tabs [hidden]=\"!logging.enabled && logging.scope\">\n                <tab *ngIf=\"this.logging.scope && logging.log_per_site\" [name]=\"'Logs'\">\n                    <log-files></log-files>\n                </tab>\n                <tab *ngIf=\"'true'\" [name]=\"'Settings'\">\n                    <fieldset class=\"path\">\n                        <label>Directory</label>\n                        <button title=\"Select Folder\" [class.background-active]=\"fileSelector.isOpen()\" class=\"right select\" (click)=\"fileSelector.toggle()\"></button>\n                        <div class=\"fill\">\n                            <input [disabled]=\"!logging.log_per_site && logging.website\" type=\"text\" class=\"form-control\" [(ngModel)]=\"logging.directory\" throttle (modelChanged)=\"onModelChanged()\" throttle required />\n                        </div>\n                        <server-file-selector #fileSelector [types]=\"['directory']\" [defaultPath]=\"logging.directory\" (selected)=\"onSelectPath($event)\"></server-file-selector>\n                    </fieldset>\n                    <fieldset *ngIf=\"!logging.website\">\n                        <label>Separate Log per Web Site</label>\n                        <switch class=\"block\" [(model)]=\"logging.log_per_site\" (modelChanged)=\"onModelChanged()\">{{logging.log_per_site ? \"On\" : \"Off\"}}</switch>\n                    </fieldset>\n                    <fieldset>\n                        <format [model]=\"logging\" (modelChange)=\"onModelChanged()\"></format>\n                    </fieldset>\n                </tab>\n                <tab *ngIf=\"logging.log_per_site || !logging.website\" [name]=\"'Rollover'\">\n                    <rollover [model]=\"logging.rollover\" (modelChange)=\"onModelChanged()\"></rollover>\n                </tab>\n                <tab *ngIf=\"logging.log_fields\" [name]=\"'Log Fields'\">\n                    <logfields [model]=\"logging.log_fields\" (modelChange)=\"onModelChanged()\"></logfields>\n                    <br />\n                    <customfields *ngIf=\"logging.custom_log_fields\" [(model)]=\"logging.custom_log_fields\" (modelChange)=\"onModelChanged()\"></customfields>\n                </tab>\n            </tabs>\n        </div>\n    ",
            styles: ["\n        .collect {\n            margin-bottom: 30px;\n        }\n\n        fieldset {\n            padding-left: 0;\n        }\n    "]
        }),
        __metadata("design:paramtypes", [logging_service_1.LoggingService,
            notification_service_1.NotificationService])
    ], LoggingComponent);
    return LoggingComponent;
}());
exports.LoggingComponent = LoggingComponent;
//# sourceMappingURL=logging.component.js.map