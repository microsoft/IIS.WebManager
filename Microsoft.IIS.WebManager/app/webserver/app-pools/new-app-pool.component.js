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
var app_pool_1 = require("./app-pool");
var app_pools_service_1 = require("./app-pools.service");
var NewAppPoolComponent = /** @class */ (function () {
    function NewAppPoolComponent(_service) {
        this._service = _service;
        this.created = new core_1.EventEmitter();
        this.cancel = new core_1.EventEmitter();
    }
    NewAppPoolComponent.prototype.ngOnInit = function () {
        this.reset();
    };
    NewAppPoolComponent.prototype.onSave = function () {
        var _this = this;
        this._service.create(this.model)
            .then(function (p) {
            _this.reset();
            _this.created.emit(p);
        });
    };
    NewAppPoolComponent.prototype.onCancel = function () {
        this.reset();
        this.cancel.emit(null);
    };
    NewAppPoolComponent.prototype.IsValid = function () {
        return this.model.name.length > 0;
    };
    NewAppPoolComponent.prototype.reset = function () {
        var pool = new app_pool_1.ApplicationPool();
        pool = new app_pool_1.ApplicationPool();
        pool.name = "";
        pool.pipeline_mode = app_pool_1.PipelineMode.Integrated;
        pool.identity = new app_pool_1.ApplicationPoolIdentity();
        pool.identity.identity_type = app_pool_1.ProcessModelIdentityType.ApplicationPoolIdentity;
        this.model = pool;
    };
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], NewAppPoolComponent.prototype, "created", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], NewAppPoolComponent.prototype, "cancel", void 0);
    NewAppPoolComponent = __decorate([
        core_1.Component({
            selector: 'new-app-pool',
            template: "\n        <fieldset>\n            <label>Name</label>\n            <input type=\"text\" class=\"form-control name\" [(ngModel)]=\"model.name\" required />\n        </fieldset>\n        <section>\n            <div class=\"collapse-heading collapsed\" data-toggle=\"collapse\" data-target=\"#settings\">\n                <h2>Settings</h2>\n            </div>\n            <div id=\"settings\" class=\"collapse\">\n                <fieldset>\n                    <identity [(model)]=\"model.identity\"></identity>\n                </fieldset>\n                <fieldset>\n                    <label>Pipeline</label>\n                    <enum [(model)]=\"model.pipeline_mode\">\n                        <field name=\"Integrated\" value=\"integrated\"></field>\n                        <field name=\"Classic\" value=\"classic\"></field>\n                    </enum>\n                </fieldset>\n                <fieldset>\n                    <label>.NET Framework</label>\n                    <enum  [(model)]=\"model.managed_runtime_version\">\n                        <field name=\"3.5\" value=\"v2.0\"></field>\n                        <field name=\"4.x\" value=\"v4.0\"></field>\n                        <field name=\"None\" value=\"\"></field>\n                    </enum>\n                </fieldset>\n            </div>\n        </section>\n        <p class=\"pull-right\">\n            <button class=\"ok\" (click)=\"onSave()\" [disabled]=\"!IsValid()\">Create</button>\n            <button class=\"cancel\" (click)=\"onCancel()\">Cancel</button>\n        </p>\n    "
        }),
        __param(0, core_1.Inject("AppPoolsService")),
        __metadata("design:paramtypes", [app_pools_service_1.AppPoolsService])
    ], NewAppPoolComponent);
    return NewAppPoolComponent;
}());
exports.NewAppPoolComponent = NewAppPoolComponent;
//# sourceMappingURL=new-app-pool.component.js.map