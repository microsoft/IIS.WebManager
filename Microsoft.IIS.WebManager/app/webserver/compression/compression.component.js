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
var compression_service_1 = require("./compression.service");
var notification_service_1 = require("../../notification/notification.service");
var CompressionComponent = /** @class */ (function () {
    function CompressionComponent(_service, _notificationService) {
        this._service = _service;
        this._notificationService = _notificationService;
        this._subscriptions = [];
    }
    CompressionComponent.prototype.ngOnInit = function () {
        var _this = this;
        this._service.initialize(this.id);
        this._subscriptions.push(this._service.compression.subscribe(function (compression) {
            _this.setFeature(compression);
        }));
    };
    CompressionComponent.prototype.ngOnDestroy = function () {
        this._subscriptions.forEach(function (sub) { return sub.unsubscribe(); });
    };
    CompressionComponent.prototype.onModelChanged = function () {
        if (!this.isValid()) {
            return;
        }
        var changes = diff_1.DiffUtil.diff(this._original, this.model);
        if (Object.keys(changes).length > 0) {
            this._service.update(changes);
        }
    };
    CompressionComponent.prototype.onRevert = function () {
        this._service.revert();
    };
    CompressionComponent.prototype.onSpaceLimit = function (value) {
        if (!value) {
            this.model.max_disk_space_usage = this._original.max_disk_space_usage;
            this.model.min_file_size = this._original.min_file_size;
        }
        this.model.do_disk_space_limitting = value;
        this.onModelChanged();
    };
    CompressionComponent.prototype.setFeature = function (feature) {
        if (feature) {
            this._locked = feature.metadata.is_locked ? true : null;
        }
        this.model = feature;
        this._original = JSON.parse(JSON.stringify(feature));
    };
    CompressionComponent.prototype.isValid = function () {
        return (!this.model.do_disk_space_limitting || ((this.model.max_disk_space_usage > 1) && (this.model.min_file_size > 1))) &&
            (!!this.model.scope || !!this.model.directory);
    };
    CompressionComponent.prototype.isPending = function () {
        return this._service.status == status_1.Status.Starting
            || this._service.status == status_1.Status.Stopping;
    };
    CompressionComponent.prototype.install = function (val) {
        var _this = this;
        if (val) {
            return this._service.install();
        }
        else {
            this._notificationService.confirm("Turn Off Response Compression", 'This will turn off "Response Compression" for the entire web server.')
                .then(function (confirmed) {
                if (confirmed) {
                    _this._service.uninstall();
                }
            });
        }
    };
    CompressionComponent.prototype.onSelectPath = function (event) {
        if (event.length == 1) {
            this.model.directory = event[0].physical_path;
            this.onModelChanged();
        }
    };
    CompressionComponent = __decorate([
        core_1.Component({
            template: "\n        <loading *ngIf=\"_service.status == 'unknown' && !_service.error\"></loading>\n        <error [error]=\"_error\"></error>\n        <switch class=\"install\" *ngIf=\"_service.webserverScope && _service.status != 'unknown'\" #s\n                [auto]=\"false\"\n                [model]=\"_service.status == 'started' || _service.status == 'starting'\" \n                [disabled]=\"_service.status == 'starting' || _service.status == 'stopping'\"\n                (modelChanged)=\"install(!s.model)\">\n                    <span *ngIf=\"!isPending()\">{{s.model ? \"On\" : \"Off\"}}</span>\n                    <span *ngIf=\"isPending()\" class=\"loading\"></span>\n        </switch>\n        <span *ngIf=\"_service.status == 'stopped' && !_service.webserverScope\">Response Compression is off. Turn it on <a [routerLink]=\"['/webserver/response-compression']\">here</a></span>\n        <override-mode class=\"pull-right\" *ngIf=\"model\" [scope]=\"model.scope\" (revert)=\"onRevert()\" [metadata]=\"model.metadata\" (modelChanged)=\"onModelChanged()\"></override-mode>\n        <div *ngIf=\"model\">\n            <fieldset>\n                <label>Dynamic Compression</label>\n                <switch class=\"block\" [disabled]=\"_locked\" [(model)]=\"model.do_dynamic_compression\" (modelChanged)=\"onModelChanged()\">{{model.do_dynamic_compression ? \"On\" : \"Off\"}}</switch>\n            </fieldset>\n            <fieldset>\n                <label>Static Compression</label>\n                <switch class=\"block\" [disabled]=\"_locked\" [(model)]=\"model.do_static_compression\" (modelChanged)=\"onModelChanged()\">{{model.do_static_compression ? \"On\" : \"Off\"}}</switch>\n            </fieldset>\n\n            <!-- Settings only visible at Web Server level -->\n            <div *ngIf=\"!model.scope\">\n                <fieldset class=\"path\">\n                    <label>Directory</label>\n                    <button title=\"Select Directory\" [class.background-active]=\"fileSelector.isOpen()\" class=\"right select\" (click)=\"fileSelector.toggle()\"></button>\n                    <div class=\"fill\">\n                        <input type=\"text\" class=\"form-control\" [(ngModel)]=\"model.directory\" (modelChanged)=\"onModelChanged()\" throttle required />\n                    </div>\n                    <server-file-selector #fileSelector [types]=\"['directory']\" [defaultPath]=\"model.directory\" (selected)=\"onSelectPath($event)\"></server-file-selector>\n                </fieldset>\n                <fieldset class=\"inline-block\">\n                    <label>Limit Storage</label>\n                    <switch class=\"block\" [model]=\"model.do_disk_space_limitting\" (modelChange)=\"onSpaceLimit($event)\">{{model.do_disk_space_limitting ? \"Yes\" : \"No\"}}</switch>\n                </fieldset>\n                <div *ngIf=\"model.do_disk_space_limitting\" class=\"inline-block\">\n                    <fieldset class=\"inline-block\">\n                        <label>Storage Quota<span class=\"units\"> (MB)</span></label>\n                        <input class=\"form-control\" type=\"number\" [(ngModel)]=\"model.max_disk_space_usage\" (modelChanged)=\"onModelChanged()\" min=\"1\" required throttle />\n                    </fieldset>\n                    <fieldset class=\"inline-block\">\n                        <label>Min File Size<span class=\"units\"> (Bytes)</span></label>\n                        <input class=\"form-control\" type=\"number\" [(ngModel)]=\"model.min_file_size\" (modelChanged)=\"onModelChanged()\" min=\"1\" required throttle />\n                    </fieldset>\n                </div>\n            </div>\n        </div>\n    "
        }),
        __metadata("design:paramtypes", [compression_service_1.CompressionService,
            notification_service_1.NotificationService])
    ], CompressionComponent);
    return CompressionComponent;
}());
exports.CompressionComponent = CompressionComponent;
//# sourceMappingURL=compression.component.js.map