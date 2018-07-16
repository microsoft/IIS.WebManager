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
var Subject_1 = require("rxjs/Subject");
var selector_1 = require("../../common/selector");
var site_1 = require("./site");
var websites_service_1 = require("./websites.service");
var app_pool_list_component_1 = require("../app-pools/app-pool-list.component");
var app_pools_service_1 = require("../app-pools/app-pools.service");
var app_pool_1 = require("../app-pools/app-pool");
var NewWebSiteComponent = /** @class */ (function () {
    function NewWebSiteComponent(_service, _appPoolService) {
        var _this = this;
        this._service = _service;
        this._appPoolService = _appPoolService;
        this._createAppPool = true;
        this._nameChange = new Subject_1.Subject();
        this.created = new core_1.EventEmitter();
        this.cancel = new core_1.EventEmitter();
        this.reset();
        //
        // Check for existing app pool by name
        this._nameChange.subscribe(function (name) {
            _this._appPoolService.getAll()
                .then(function (pools) {
                pools.forEach(function (pool) {
                    if (pool.name.toUpperCase() === name.toUpperCase()) {
                        _this.site.application_pool = pool;
                        _this._createAppPool = false;
                        if (_this.poolSelect) {
                            _this.poolSelect.close();
                        }
                    }
                });
            });
        });
    }
    NewWebSiteComponent.prototype.onSave = function () {
        var _this = this;
        if (this._createAppPool) {
            //
            // Create AppPool
            var appPool = new app_pool_1.ApplicationPool();
            appPool.name = this.site.name;
            this._appPoolService.create(appPool).then(function (p) {
                //
                // Create Site
                _this.site.application_pool = p;
                _this._service.create(_this.site)
                    .then(function (s) {
                    _this.reset();
                    _this.created.emit(s);
                }).catch(function (e) {
                    // We created an application pool but could not create the site.
                    // The AppPool should be deleted.
                    _this._appPoolService.delete(p);
                    throw e;
                });
            });
        }
        else {
            this._service.create(this.site)
                .then(function (s) {
                _this.reset();
                _this.created.emit(s);
            });
        }
    };
    NewWebSiteComponent.prototype.onCancel = function () {
        this.reset();
        this.cancel.emit(null);
    };
    NewWebSiteComponent.prototype.onNewAppPool = function (value) {
        var _this = this;
        if (!value) {
            this.site.application_pool = null;
            setTimeout(function () { return _this.selectAppPool(); }, 10);
        }
    };
    NewWebSiteComponent.prototype.IsValid = function () {
        return !(!this.site.name || !this.site.physical_path || this.site.bindings.length == 0);
    };
    NewWebSiteComponent.prototype.reset = function () {
        var site = new site_1.WebSite();
        site = new site_1.WebSite();
        site.name = "";
        site.physical_path = "";
        site.bindings = new Array();
        var binding = {
            hostname: "",
            port: 80,
            ip_address: "*",
            is_https: false,
            certificate: null,
            binding_information: null,
            protocol: "http",
            require_sni: false
        };
        site.bindings.unshift(binding);
        this.site = site;
        this._createAppPool = true;
    };
    NewWebSiteComponent.prototype.onNameChange = function (val) {
        this.site.name = val;
        this._nameChange.next(val);
    };
    NewWebSiteComponent.prototype.selectAppPool = function () {
        this.poolSelect.toggle();
        if (this.poolSelect.opened) {
            this.appPools.activate();
        }
    };
    NewWebSiteComponent.prototype.onAppPoolSelected = function (pool) {
        this.poolSelect.close();
        if (this.site.application_pool && this.site.application_pool.id == pool.id) {
            return;
        }
        this.site.application_pool = pool;
    };
    NewWebSiteComponent.prototype.onSelectPath = function (event) {
        if (event.length == 1) {
            this.site.physical_path = event[0].physical_path;
        }
    };
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], NewWebSiteComponent.prototype, "created", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], NewWebSiteComponent.prototype, "cancel", void 0);
    __decorate([
        core_1.ViewChild('poolSelect'),
        __metadata("design:type", selector_1.Selector)
    ], NewWebSiteComponent.prototype, "poolSelect", void 0);
    __decorate([
        core_1.ViewChild('appPools'),
        __metadata("design:type", app_pool_list_component_1.AppPoolListComponent)
    ], NewWebSiteComponent.prototype, "appPools", void 0);
    NewWebSiteComponent = __decorate([
        core_1.Component({
            selector: 'new-website',
            template: "\n        <tabs>\n            <tab [name]=\"'Settings'\">\n                <fieldset>\n                    <label>Name</label>\n                    <input type=\"text\" class=\"form-control name\" [ngModel]=\"site.name\" (ngModelChange)=\"onNameChange($event)\" required />\n                </fieldset>\n                <fieldset class=\"path\">\n                    <label>Physical Path</label>\n                    <button [class.background-active]=\"fileSelector.isOpen()\" title=\"Select Folder\" class=\"right select\" (click)=\"fileSelector.toggle()\"></button>\n                    <div class=\"fill\">\n                        <input type=\"text\" class=\"form-control\" [(ngModel)]=\"site.physical_path\" required />\n                    </div>\n                    <server-file-selector #fileSelector [types]=\"['directory']\" [defaultPath]=\"site.physical_path\" (selected)=\"onSelectPath($event)\"></server-file-selector>\n                </fieldset>\n            </tab>\n            <tab [name]=\"'Bindings'\">\n                <binding-list #bindingList [(model)]=\"site.bindings\"></binding-list>\n            </tab>\n            <tab [name]=\"'Application Pool'\">\n                <fieldset>\n                    <label>Create Own Application Pool</label>\n                    <switch class=\"block\" [(model)]=\"_createAppPool\" (modelChange)=\"onNewAppPool($event)\">{{_createAppPool ? \"Yes\" : \"No\"}}</switch>\n                </fieldset>\n                <div class=\"app-pool\" *ngIf=\"!_createAppPool\">\n                    <button [class.background-active]=\"poolSelect.opened\" (click)=\"selectAppPool()\">{{!site.application_pool ? \"Choose Application Pool\" : \"Change Application Pool\" }} <i class=\"fa fa-caret-down\"></i></button>\n                    <selector #poolSelect class=\"container-fluid create\">\n                        <app-pools #appPools [actions]=\"'view'\" [lazy]=\"true\" (itemSelected)=\"onAppPoolSelected($event)\"></app-pools>\n                    </selector>\n                    <fieldset>\n                        <app-pool-details *ngIf=\"site.application_pool\" [model]=\"site.application_pool\"></app-pool-details>\n                    </fieldset>\n                </div>\n            </tab>\n        </tabs>\n        <p class=\"pull-right\">\n            <button (click)=\"onSave()\" [disabled]=\"!IsValid() || bindingList.isEditing()\">\n                <i title=\"Create\" class=\"fa fa-check color-active\"></i> Create\n            </button>\n            <button (click)=\"onCancel()\">\n                <i class=\"fa fa-times red\"></i> Cancel\n            </button>\n        </p>\n    ",
            styles: ["\n        h2 {\n            margin-top: 32px;\n            margin-bottom: 18px;\n        }\n\n        ul {\n            margin-bottom: 32px;\n        }\n\n        p {\n            margin: 10px 0;\n        }\n\n        .app-pool > button {\n            margin-top: 10px;\n        }\n    "]
        }),
        __param(0, core_1.Inject("WebSitesService")),
        __param(1, core_1.Inject("AppPoolsService")),
        __metadata("design:paramtypes", [websites_service_1.WebSitesService,
            app_pools_service_1.AppPoolsService])
    ], NewWebSiteComponent);
    return NewWebSiteComponent;
}());
exports.NewWebSiteComponent = NewWebSiteComponent;
//# sourceMappingURL=new-website.component.js.map