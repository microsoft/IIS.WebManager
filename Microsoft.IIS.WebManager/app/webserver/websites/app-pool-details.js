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
var selector_1 = require("../../common/selector");
var app_pools_service_1 = require("../app-pools/app-pools.service");
var app_pool_1 = require("../app-pools/app-pool");
var diff_1 = require("../../utils/diff");
var AppPoolDetailsComponent = /** @class */ (function () {
    function AppPoolDetailsComponent(_svc) {
        this._svc = _svc;
    }
    AppPoolDetailsComponent.prototype.ngOnInit = function () {
        this.setAppPool(this.model);
    };
    AppPoolDetailsComponent.prototype.onModelChanged = function () {
        var _this = this;
        if (!this._svc) {
            return;
        }
        // Set up diff object
        var changes = diff_1.DiffUtil.diff(this._original, this.model);
        if (Object.keys(changes).length > 0) {
            var id = this.model.id;
            this._svc.update(this.model, changes).then(function (p) {
                _this.setAppPool(p);
            });
        }
    };
    AppPoolDetailsComponent.prototype.setAppPool = function (p) {
        this.model = p;
        this._original = JSON.parse(JSON.stringify(p));
    };
    AppPoolDetailsComponent.prototype.openSelector = function () {
        this._selector.toggle();
    };
    Object.defineProperty(AppPoolDetailsComponent.prototype, "started", {
        get: function () {
            return this.model.status == 'started';
        },
        enumerable: true,
        configurable: true
    });
    AppPoolDetailsComponent.prototype.onStart = function (e) {
        this._selector.close();
        this._svc.start(this.model);
    };
    AppPoolDetailsComponent.prototype.onStop = function (e) {
        this._selector.close();
        this._svc.stop(this.model);
    };
    AppPoolDetailsComponent.prototype.onRecycle = function (e) {
        this._selector.close();
        this._svc.recycle(this.model);
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", app_pool_1.ApplicationPool)
    ], AppPoolDetailsComponent.prototype, "model", void 0);
    __decorate([
        core_1.ViewChild(selector_1.Selector),
        __metadata("design:type", selector_1.Selector)
    ], AppPoolDetailsComponent.prototype, "_selector", void 0);
    AppPoolDetailsComponent = __decorate([
        core_1.Component({
            selector: 'app-pool-details',
            template: "\n        <fieldset>\n            <label>Name</label>\n            <span class=\"name\">{{model.name}}</span>\n            <span class=\"status\" *ngIf=\"!started\">({{model.status}})</span>\n            <div class=\"actions\">\n                <div class=\"selector-wrapper\">\n                    <button title=\"Actions\" (click)=\"openSelector()\" [class.background-active]=\"(_selector && _selector.opened) || false\"><i class=\"fa fa-caret-down\"></i></button>\n                    <selector [right]=\"true\">\n                        <ul>\n                            <li><a class=\"bttn edit\" title=\"Edit\" [routerLink]=\"['/webserver/app-pools', model.id]\">Edit</a></li>\n                            <li><button class=\"refresh\" title=\"Recycle\" [attr.disabled]=\"!started || null\" (click)=\"onRecycle()\">Recycle</button></li>\n                            <li><button class=\"start\" title=\"Start\" [attr.disabled]=\"model.status != 'stopped' ? true : null\" (click)=\"onStart()\">Start</button></li>\n                            <li><button class=\"stop\" title=\"Stop\" [attr.disabled]=\"!started || null\" (click)=\"onStop()\">Stop</button></li>\n                        </ul>\n                    </selector>\n                </div>\n            </div>\n        </fieldset>\n        <fieldset *ngIf=\"_svc\">\n            <label>Auto Start</label>\n            <switch class=\"block\" [(model)]=\"model.auto_start\" (modelChanged)=\"onModelChanged()\">{{model.auto_start ? \"On\" : \"Off\"}}</switch>\n        </fieldset>\n        <fieldset *ngIf=\"_svc\">\n            <identity [model]=\"model.identity\" [useUserProfile]=\"false\" (modelChanged)=\"onModelChanged()\"></identity>\n        </fieldset>\n        <fieldset *ngIf=\"_svc\">\n            <label>Pipeline</label>\n            <enum [(model)]=\"model.pipeline_mode\" (modelChanged)=\"onModelChanged()\">\n                <field name=\"Integrated\" value=\"integrated\"></field>\n                <field name=\"Classic\" value=\"classic\"></field>\n            </enum>\n        </fieldset>\n        <fieldset *ngIf=\"_svc\">\n            <label>.NET Framework</label>\n            <enum [(model)]=\"model.managed_runtime_version\" (modelChanged)=\"onModelChanged()\">\n                <field name=\"3.5\" value=\"v2.0\"></field>\n                <field name=\"4.x\" value=\"v4.0\"></field>\n                <field name=\"None\" value=\"\"></field>\n            </enum>\n        </fieldset>\n    ",
            styles: ["\n        .name {\n            font-size: 16px;\n        }\n\n        .selector-wrapper {\n            position: relative;\n        }\n\n        .actions {\n            float: none;\n        }\n\n        .actions ul {\n            margin-bottom: 0;\n        }\n    "]
        }),
        __param(0, core_1.Optional()), __param(0, core_1.Inject("AppPoolsService")),
        __metadata("design:paramtypes", [app_pools_service_1.AppPoolsService])
    ], AppPoolDetailsComponent);
    return AppPoolDetailsComponent;
}());
exports.AppPoolDetailsComponent = AppPoolDetailsComponent;
//# sourceMappingURL=app-pool-details.js.map