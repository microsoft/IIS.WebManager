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
var app_pools_service_1 = require("./app-pools.service");
var AppPoolComponent = /** @class */ (function () {
    function AppPoolComponent(_route, _service, _options, _router) {
        this._route = _route;
        this._service = _service;
        this._options = _options;
        this._router = _router;
        this.modules = [];
        this.id = this._route.snapshot.params['id'];
    }
    AppPoolComponent.prototype.ngOnInit = function () {
        var _this = this;
        this._service.get(this.id)
            .then(function (p) {
            _this.setAppPool(p);
            module_1.ModuleUtil.initModules(_this.modules, _this.pool, "appPool");
        })
            .catch(function (s) {
            if (s && s.status == '404') {
                _this.notFound = true;
            }
        });
    };
    AppPoolComponent.prototype.onModelChanged = function () {
        var _this = this;
        if (!this.pool) {
            return;
        }
        // Set up diff object
        var changes = diff_1.DiffUtil.diff(this._original, this.pool);
        if (Object.keys(changes).length > 0) {
            var id = this.pool.id;
            this._service.update(this.pool, changes).then(function (p) {
                if (p.id != id) {
                    //
                    // Refresh if the Id has changed
                    _this._router.navigate(['webserver', 'app-pools', p.id]);
                }
                else {
                    _this.setAppPool(p);
                }
            });
        }
    };
    AppPoolComponent.prototype.setAppPool = function (p) {
        this.pool = p;
        this._original = JSON.parse(JSON.stringify(p));
    };
    AppPoolComponent = __decorate([
        core_1.Component({
            template: "\n        <not-found *ngIf=\"notFound\"></not-found>\n        <loading *ngIf=\"!(pool || notFound)\"></loading>\n        <app-pool-header *ngIf=\"pool\" [pool]=\"pool\" class=\"crumb-content\" [class.sidebar-nav-content]=\"_options.active\"></app-pool-header>\n\n        <div *ngIf=\"pool\" class=\"sidebar crumb\" [class.nav]=\"_options.active\">\n            <ul class=\"crumbs\">\n                <li><a [routerLink]=\"['/webserver']\">Web Server</a></li>\n                <li><a [routerLink]=\"['/webserver/application-pools']\">Application Pools</a></li>\n            </ul>\n            <vtabs [markLocation]=\"true\" (activate)=\"_options.refresh()\">\n                <item [name]=\"'General'\" [ico]=\"'fa fa-wrench'\">\n                    <app-pool-general [pool]=\"pool\" (modelChanged)=\"onModelChanged()\"></app-pool-general>\n                </item>\n                <item *ngFor=\"let module of modules\" [name]=\"module.name\" [ico]=\"module.ico\">\n                    <dynamic [name]=\"module.component_name\" [module]=\"module.module\" [data]=\"module.data\"></dynamic>\n                </item>\n            </vtabs>\n        </div>\n    ",
            styles: ["\n        :host >>> .sidebar > vtabs .vtabs > .items {\n            top: 35px;\n        }\n\n        :host >>> .sidebar > vtabs .vtabs > .content {\n            top: 96px;\n        }\n    "]
        }),
        __param(1, core_1.Inject("AppPoolsService")),
        __metadata("design:paramtypes", [router_1.ActivatedRoute,
            app_pools_service_1.AppPoolsService,
            options_service_1.OptionsService,
            router_1.Router])
    ], AppPoolComponent);
    return AppPoolComponent;
}());
exports.AppPoolComponent = AppPoolComponent;
//# sourceMappingURL=app-pool.component.js.map