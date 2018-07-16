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
var module_1 = require("../../utils/module");
var diff_1 = require("../../utils/diff");
var options_service_1 = require("../../main/options.service");
var webapps_service_1 = require("./webapps.service");
var WebAppComponent = /** @class */ (function () {
    function WebAppComponent(_route, _service, _options, _router) {
        this._route = _route;
        this._service = _service;
        this._options = _options;
        this._router = _router;
        this.modules = [];
        this.id = this._route.snapshot.params["id"];
    }
    WebAppComponent.prototype.ngOnInit = function () {
        var _this = this;
        this._service.get(this.id)
            .then(function (app) {
            _this.setApp(app);
            module_1.ModuleUtil.initModules(_this.modules, _this.app, "webapp");
        })
            .catch(function (s) {
            if (s && s.status == '404') {
                _this.notFound = true;
            }
        });
    };
    WebAppComponent.prototype.onModelChanged = function () {
        var _this = this;
        if (!this.app) {
            return;
        }
        //
        // Track model changes
        var changes = diff_1.DiffUtil.diff(this._original, this.app);
        if (Object.keys(changes).length > 0) {
            var id = this.app.id;
            this._service.update(this.app, changes).then(function (app) {
                if (id != app.id) {
                    //
                    // Refresh if the Id has changed
                    _this._router.navigate(['/WebServer/WebApps/WebApp', { id: app.id }]);
                }
                else {
                    _this.setApp(app);
                }
            });
        }
    };
    WebAppComponent.prototype.setApp = function (app) {
        this.app = app;
        this._original = JSON.parse(JSON.stringify(app));
    };
    WebAppComponent = __decorate([
        core_1.Component({
            template: "\n        <not-found *ngIf=\"notFound\"></not-found>\n        <loading *ngIf=\"!(app || notFound)\"></loading>\n        <webapp-header *ngIf=\"app\" [model]=\"app\" class=\"crumb-content\" [class.sidebar-nav-content]=\"_options.active\"></webapp-header>\n\n        <div *ngIf=\"app\" class=\"sidebar crumb\" [class.nav]=\"_options.active\">\n            <ul class=\"crumbs\">\n                <li><a [routerLink]=\"['/webserver']\">Web Server</a></li>\n                <li><a [routerLink]=\"['/webserver/web-sites/']\">Web Sites</a></li>\n                <li><a [routerLink]=\"['/webserver/websites/', app.website.id]\">{{app.website.name}}</a></li>\n            </ul>\n            <vtabs [markLocation]=\"true\" (activate)=\"_options.refresh()\">\n                <item [name]=\"'General'\" [ico]=\"'fa fa-wrench'\">\n                    <webapp-general [model]=\"app\" (modelChanged)=\"onModelChanged()\"></webapp-general>\n                </item>\n                <item *ngFor=\"let module of modules\" [name]=\"module.name\" [ico]=\"module.ico\">\n                    <dynamic [name]=\"module.component_name\" [module]=\"module.module\" [data]=\"module.data\"></dynamic>\n                </item>\n            </vtabs>\n        </div>\n    ",
            styles: ["\n        :host >>> .sidebar > vtabs .vtabs > .items {\n            top: 35px;\n        }\n\n        :host >>> .sidebar > vtabs .vtabs > .content {\n            top: 96px;\n        }\n    "]
        }),
        __param(1, core_1.Inject("WebAppsService")),
        __metadata("design:paramtypes", [router_1.ActivatedRoute,
            webapps_service_1.WebAppsService,
            options_service_1.OptionsService,
            router_1.Router])
    ], WebAppComponent);
    return WebAppComponent;
}());
exports.WebAppComponent = WebAppComponent;
//# sourceMappingURL=webapp.component.js.map