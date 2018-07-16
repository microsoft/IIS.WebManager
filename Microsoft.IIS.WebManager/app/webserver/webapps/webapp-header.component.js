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
var selector_1 = require("../../common/selector");
var webapp_1 = require("./webapp");
var webapps_service_1 = require("./webapps.service");
var websites_service_1 = require("../websites/websites.service");
var WebAppHeaderComponent = /** @class */ (function () {
    function WebAppHeaderComponent(_service, _siteService, _router) {
        this._service = _service;
        this._siteService = _siteService;
        this._router = _router;
    }
    WebAppHeaderComponent.prototype.onDelete = function () {
        var _this = this;
        if (confirm("Are you sure you would like to delete '" + this.model.path + "'?")) {
            this._service.delete(this.model)
                .then(function () {
                _this._router.navigate(['/webserver/websites/', { id: _this.model.website.id }]);
            });
        }
        this._selector.close();
    };
    Object.defineProperty(WebAppHeaderComponent.prototype, "url", {
        get: function () {
            if (!this.model.website || this.model.website.bindings.length == 0) {
                return "";
            }
            return this._siteService.getUrl(this.model.website.bindings[0]) + this.model.path;
        },
        enumerable: true,
        configurable: true
    });
    __decorate([
        core_1.Input(),
        __metadata("design:type", webapp_1.WebApp)
    ], WebAppHeaderComponent.prototype, "model", void 0);
    __decorate([
        core_1.ViewChild(selector_1.Selector),
        __metadata("design:type", selector_1.Selector)
    ], WebAppHeaderComponent.prototype, "_selector", void 0);
    WebAppHeaderComponent = __decorate([
        core_1.Component({
            selector: 'webapp-header',
            template: "\n        <div class=\"feature-header\">\n            <div class=\"actions\">\n                <div class=\"selector-wrapper\">\n                    <button title=\"Actions\" (click)=\"_selector.toggle()\" [class.background-active]=\"(_selector && _selector.opened) || false\"><i class=\"fa fa-caret-down\"></i></button>\n                    <selector [right]=\"true\">\n                        <ul>\n                            <li><a class=\"bttn link\" title=\"Browse\" [attr.title]=\"url\" [attr.href]=\"url\" target=\"_blank\">Browse</a></li>\n                            <li><button class=\"delete\" title=\"Delete\" (click)=\"onDelete()\">Delete</button></li>\n                        </ul>\n                    </selector>\n                </div>\n            </div>\n            <div class=\"feature-title\">\n                <h1 [title]=\"model.website.name + model.path\">{{model.path}}</h1>\n            </div>\n        </div>\n    ",
            styles: ["\n        .selector-wrapper {\n            position: relative;\n        }\n\n        .feature-title h1:before {\n            content: \"\\f121\";\n        }\n    "]
        }),
        __param(0, core_1.Inject("WebAppsService")),
        __param(1, core_1.Inject("WebSitesService")),
        __metadata("design:paramtypes", [webapps_service_1.WebAppsService,
            websites_service_1.WebSitesService,
            router_1.Router])
    ], WebAppHeaderComponent);
    return WebAppHeaderComponent;
}());
exports.WebAppHeaderComponent = WebAppHeaderComponent;
//# sourceMappingURL=webapp-header.component.js.map