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
var websites_service_1 = require("./websites.service");
var module_1 = require("../../utils/module");
var diff_1 = require("../../utils/diff");
var options_service_1 = require("../../main/options.service");
var WebSiteComponent = /** @class */ (function () {
    function WebSiteComponent(_route, _service, _options) {
        this._route = _route;
        this._service = _service;
        this._options = _options;
        this.modules = [];
        this.id = this._route.snapshot.params['id'];
    }
    WebSiteComponent.prototype.ngOnInit = function () {
        var _this = this;
        //
        // Async get website
        this._service.get(this.id)
            .then(function (s) {
            _this.setSite(s);
            module_1.ModuleUtil.initModules(_this.modules, _this.site, "website");
        })
            .catch(function (s) {
            if (s && s.status == '404') {
                _this.notFound = true;
            }
        });
    };
    WebSiteComponent.prototype.onModelChanged = function () {
        var _this = this;
        //
        // Track model changes
        if (this.site) {
            // Set up diff object
            var changes = diff_1.DiffUtil.diff(this._original, this.site);
            if (Object.keys(changes).length > 0) {
                this._service.update(this.site, changes).then(function (s) { return _this.setSite(s); });
            }
        }
    };
    WebSiteComponent.prototype.setSite = function (s) {
        this.site = s;
        this._original = JSON.parse(JSON.stringify(s));
    };
    WebSiteComponent = __decorate([
        core_1.Component({
            template: "\n        <not-found *ngIf=\"notFound\"></not-found>\n        <loading *ngIf=\"!(site || notFound)\"></loading>\n        <website-header *ngIf=\"site\" [site]=\"site\" class=\"crumb-content\" [class.sidebar-nav-content]=\"_options.active\"></website-header>\n        <div *ngIf=\"site\" class=\"sidebar crumb\" [class.nav]=\"_options.active\">\n            <ul class=\"crumbs\">\n                <li><a [routerLink]=\"['/webserver']\">Web Server</a></li>\n                <li><a [routerLink]=\"['/webserver/web-sites']\">Web Sites</a></li>\n            </ul>\n            <vtabs [markLocation]=\"true\" (activate)=\"_options.refresh()\">\n                <item [name]=\"'General'\" [ico]=\"'fa fa-wrench'\">\n                    <website-general [site]=\"site\" (modelChanged)=\"onModelChanged()\"></website-general>\n                </item>\n                <item *ngFor=\"let module of modules\" [name]=\"module.name\" [ico]=\"module.ico\">\n                    <dynamic [name]=\"module.component_name\" [module]=\"module.module\" [data]=\"module.data\"></dynamic>\n                </item>\n            </vtabs>\n        </div>\n    ",
            styles: ["\n        :host >>> .sidebar vtabs .vtabs > .items {\n            top: 35px;\n        }\n\n        :host >>> .sidebar vtabs .vtabs > .content {\n            top: 96px;\n        }\n    "]
        }),
        __param(1, core_1.Inject("WebSitesService")),
        __metadata("design:paramtypes", [router_1.ActivatedRoute,
            websites_service_1.WebSitesService,
            options_service_1.OptionsService])
    ], WebSiteComponent);
    return WebSiteComponent;
}());
exports.WebSiteComponent = WebSiteComponent;
//# sourceMappingURL=website.component.js.map