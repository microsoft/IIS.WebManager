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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var notification_service_1 = require("../../notification/notification.service");
var selector_1 = require("../../common/selector");
var websites_service_1 = require("./websites.service");
var site_1 = require("./site");
var WebSiteHeaderComponent = /** @class */ (function () {
    function WebSiteHeaderComponent(_service, _router, _notificationService) {
        this._service = _service;
        this._router = _router;
        this._notificationService = _notificationService;
    }
    WebSiteHeaderComponent.prototype.onStart = function () {
        this._service.start(this.site);
        this._selector.close();
    };
    WebSiteHeaderComponent.prototype.onStop = function () {
        this._service.stop(this.site);
        this._selector.close();
    };
    WebSiteHeaderComponent.prototype.onDelete = function () {
        var _this = this;
        this._notificationService.confirm("Delete Web Site", "Are you sure you would like to delete '" + this.site.name + "'?")
            .then(function (confirmed) {
            if (confirmed) {
                _this._service.delete(_this.site)
                    .then(function () {
                    _this._router.navigate(["/webserver/web-sites"]);
                });
            }
            _this._selector.close();
        });
    };
    Object.defineProperty(WebSiteHeaderComponent.prototype, "url", {
        get: function () {
            if (this.site.bindings.length == 0) {
                return "";
            }
            return this._service.getUrl(this.site.bindings[0]);
        },
        enumerable: true,
        configurable: true
    });
    __decorate([
        core_1.Input(),
        __metadata("design:type", site_1.WebSite)
    ], WebSiteHeaderComponent.prototype, "site", void 0);
    __decorate([
        core_1.ViewChild(selector_1.Selector),
        __metadata("design:type", selector_1.Selector)
    ], WebSiteHeaderComponent.prototype, "_selector", void 0);
    WebSiteHeaderComponent = __decorate([
        core_1.Component({
            selector: 'website-header',
            template: "\n        <div class=\"feature-header\" *ngIf=\"site\">\n            <div class=\"actions\">\n                <div class=\"selector-wrapper\">\n                    <button title=\"Actions\" (click)=\"_selector.toggle()\" [class.background-active]=\"(_selector && _selector.opened) || false\"><i class=\"fa fa-caret-down\"></i></button>\n                    <selector [right]=\"true\">\n                        <ul>\n                            <li><a class=\"bttn link\" title=\"Browse\" [attr.title]=\"url\" [attr.href]=\"url\" target=\"_blank\">Browse</a></li>\n                            <li><button class=\"start\" title=\"Start\" [attr.disabled]=\"site.status == 'started' ? true : null\" (click)=\"onStart()\">Start</button></li>\n                            <li><button class=\"stop\" title=\"Stop\" [attr.disabled]=\"site.status == 'stopped' ? true : null\" (click)=\"onStop()\">Stop</button></li>\n                            <li><button class=\"delete\" title=\"Delete\" (click)=\"onDelete()\">Delete</button></li>\n                        </ul>\n                    </selector>\n                </div>\n            </div>\n            \n            <div class=\"feature-title\">\n                <h1 [ngClass]=\"site.status\">{{site.name}}</h1>\n                <span class=\"status\" *ngIf=\"site.status == 'stopped'\">{{site.status}}</span>\n            </div>\n        </div>\n    ",
            styles: ["\n        .selector-wrapper {\n            position: relative;\n        }\n\n        .feature-title h1:before {\n            content: \"\\f0ac\";\n        }\n\n        .status {\n            display: block;\n            text-align: right;\n        }\n    "]
        }),
        __param(0, core_1.Inject("WebSitesService")),
        __metadata("design:paramtypes", [websites_service_1.WebSitesService,
            router_1.Router,
            notification_service_1.NotificationService])
    ], WebSiteHeaderComponent);
    return WebSiteHeaderComponent;
}());
exports.WebSiteHeaderComponent = WebSiteHeaderComponent;
//# sourceMappingURL=website-header.component.js.map