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
var status_1 = require("../../common/status");
var notification_service_1 = require("../../notification/notification.service");
var url_rewrite_service_1 = require("./service/url-rewrite.service");
var UrlRewriteComponent = /** @class */ (function () {
    function UrlRewriteComponent(_service, _notificationService) {
        this._service = _service;
        this._notificationService = _notificationService;
    }
    UrlRewriteComponent.prototype.ngOnInit = function () {
        this._service.initialize(this.id);
    };
    UrlRewriteComponent.prototype.isPending = function () {
        return this._service.status == status_1.Status.Starting
            || this._service.status == status_1.Status.Stopping;
    };
    UrlRewriteComponent.prototype.install = function (val) {
        var _this = this;
        if (val) {
            return this._service.install();
        }
        else {
            this._notificationService.confirm("Uninstall URL Rewrite", 'This will uninstall "URL Rewrite" for the entire web server.')
                .then(function (confirmed) {
                if (confirmed) {
                    _this._service.uninstall();
                }
            });
        }
    };
    UrlRewriteComponent = __decorate([
        core_1.Component({
            template: "\n        <loading *ngIf=\"_service.status == 'unknown' && !_service.error\"></loading>\n        <error [error]=\"_service.error\"></error>\n        <switch class=\"install\" *ngIf=\"_service.webserverScope && _service.status != 'unknown'\" #s\n                [auto]=\"false\"\n                [model]=\"_service.status == 'started' || _service.status == 'starting'\" \n                [disabled]=\"_service.status == 'starting' || _service.status == 'stopping'\"\n                (modelChanged)=\"install(!s.model)\">\n                    <span *ngIf=\"!isPending()\">{{s.model ? \"On\" : \"Off\"}}</span>\n                    <span *ngIf=\"isPending()\" class=\"loading\"></span>\n        </switch>\n        <span *ngIf=\"_service.status == 'stopped' && !_service.webserverScope\">URL Rewrite is not installed. Install it <a [routerLink]=\"['/webserver/url-rewrite']\">here</a></span>\n        <div *ngIf=\"_service.status == 'started'\">\n            <tabs>\n                <tab [name]=\"'Inbound Rules'\">\n                    <inbound-rules></inbound-rules>\n                </tab>\n                <tab [name]=\"'Outbound Rules'\">\n                    <outbound-rules></outbound-rules>\n                </tab>\n                <tab [name]=\"'Server Variables'\">\n                    <server-variables></server-variables>\n                </tab>\n                <tab [name]=\"'Rewrite Maps'\">\n                    <rewrite-maps></rewrite-maps>\n                </tab>\n                <tab [name]=\"'Providers'\">\n                    <providers></providers>\n                </tab>\n            </tabs>\n        </div>\n    ",
            styles: ["\n        .install {\n            margin-bottom: 45px;\n        }\n    "]
        }),
        __metadata("design:paramtypes", [url_rewrite_service_1.UrlRewriteService,
            notification_service_1.NotificationService])
    ], UrlRewriteComponent);
    return UrlRewriteComponent;
}());
exports.UrlRewriteComponent = UrlRewriteComponent;
//# sourceMappingURL=url-rewrite.component.js.map