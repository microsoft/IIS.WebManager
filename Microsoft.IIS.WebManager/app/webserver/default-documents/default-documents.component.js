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
var default_documents_service_1 = require("./default-documents.service");
var notification_service_1 = require("../../notification/notification.service");
var DefaultDocumentsComponent = /** @class */ (function () {
    function DefaultDocumentsComponent(_service, _notificationService) {
        this._service = _service;
        this._notificationService = _notificationService;
        this._subscriptions = [];
    }
    DefaultDocumentsComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.reset();
        this._subscriptions.push(this._service.defaultDocument.subscribe(function (doc) {
            _this.setFeature(doc);
        }));
    };
    DefaultDocumentsComponent.prototype.ngOnDestroy = function () {
        this._subscriptions.forEach(function (sub) { return sub.unsubscribe(); });
    };
    DefaultDocumentsComponent.prototype.onModelChanged = function () {
        var _this = this;
        if (this._defDoc) {
            var changes = diff_1.DiffUtil.diff(this._original, this._defDoc);
            if (Object.keys(changes).length > 0) {
                this._service.update(changes)
                    .then(function (feature) {
                    _this.setFeature(feature);
                });
            }
        }
    };
    DefaultDocumentsComponent.prototype.setFeature = function (defDoc) {
        this._defDoc = defDoc;
        this._original = JSON.parse(JSON.stringify(defDoc));
    };
    DefaultDocumentsComponent.prototype.onRevert = function () {
        var _this = this;
        this._service.revert().then(function (d) { return _this.setFeature(d); });
    };
    DefaultDocumentsComponent.prototype.isPending = function () {
        return this._service.status == status_1.Status.Starting
            || this._service.status == status_1.Status.Stopping;
    };
    DefaultDocumentsComponent.prototype.reset = function () {
        this.setFeature(null);
        this._service.init(this.id);
    };
    DefaultDocumentsComponent.prototype.install = function (val) {
        var _this = this;
        if (val) {
            return this._service.install();
        }
        else {
            this._notificationService.confirm("Turn Off Default Documents", 'This will turn off "Default Documents" for the entire web server.')
                .then(function (confirmed) {
                if (confirmed) {
                    _this._service.uninstall();
                }
            });
        }
    };
    DefaultDocumentsComponent = __decorate([
        core_1.Component({
            template: "\n        <loading *ngIf=\"_service.status == 'unknown' && !_service.error\"></loading>\n        <override-mode class=\"pull-right\" \n            *ngIf=\"_defDoc\" \n            [metadata]=\"_defDoc.metadata\"\n            [scope]=\"_defDoc.scope\"\n            (revert)=\"onRevert()\" \n            (modelChanged)=\"onModelChanged()\"></override-mode>\n        <switch class=\"install\" *ngIf=\"_service.webserverScope && _service.status != 'unknown'\" #s\n                [auto]=\"false\"\n                [model]=\"_service.status == 'started' || _service.status == 'starting'\" \n                [disabled]=\"_service.status == 'starting' || _service.status == 'stopping'\"\n                (modelChanged)=\"install(!s.model)\">\n                    <span *ngIf=\"!isPending()\">{{s.model ? \"On\" : \"Off\"}}</span>\n                    <span *ngIf=\"isPending()\" class=\"loading\"></span>\n        </switch>\n        <span *ngIf=\"_service.status == 'stopped' && !_service.webserverScope\">Default Documents are off. Turn them on <a [routerLink]=\"['/webserver/default-documents']\">here</a></span>\n        <div *ngIf=\"_defDoc\" [attr.disabled]=\"_defDoc.metadata.is_locked ? true : null\">\n            <fieldset>\n                <label *ngIf=\"!_defDoc.scope\">Web Site Default</label>\n                <switch class=\"block\" [(model)]=\"_defDoc.enabled\" (modelChanged)=\"onModelChanged()\">{{_defDoc.enabled ? \"On\" : \"Off\"}}</switch>\n            </fieldset>\n            <files *ngIf=\"_defDoc.enabled || !_defDoc.scope\"></files>\n        </div>\n    ",
            styles: ["\n        files {\n            display: block;\n            margin-top: 23px;\n        }\n    "]
        }),
        __metadata("design:paramtypes", [default_documents_service_1.DefaultDocumentsService,
            notification_service_1.NotificationService])
    ], DefaultDocumentsComponent);
    return DefaultDocumentsComponent;
}());
exports.DefaultDocumentsComponent = DefaultDocumentsComponent;
//# sourceMappingURL=default-documents.component.js.map