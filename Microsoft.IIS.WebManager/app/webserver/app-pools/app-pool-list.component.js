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
var app_pools_service_1 = require("./app-pools.service");
var AppPoolListComponent = /** @class */ (function () {
    function AppPoolListComponent(_service, _router) {
        this._service = _service;
        this._router = _router;
        this.actions = "recycle,start,stop,delete";
        this.lazy = false;
        this.itemSelected = new core_1.EventEmitter();
        this._subs = [];
    }
    AppPoolListComponent.prototype.ngOnInit = function () {
        if (!this.lazy) {
            this.activate();
        }
    };
    AppPoolListComponent.prototype.ngOnDestroy = function () {
        this._subs.forEach(function (s) { return s.unsubscribe(); });
    };
    AppPoolListComponent.prototype.activate = function () {
        var _this = this;
        this.lazy = false;
        if (this._appPools) {
            return;
        }
        this._service.getAll().then(function (_) {
            _this._subs.push(_this._service.appPools.subscribe(function (pools) {
                _this._appPools = [];
                pools.forEach(function (p) { return _this._appPools.push(p); });
            }));
        });
    };
    AppPoolListComponent.prototype.onItemClicked = function (pool) {
        if (this.itemSelected.observers.length > 0) {
            this.itemSelected.emit(pool);
        }
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], AppPoolListComponent.prototype, "actions", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], AppPoolListComponent.prototype, "lazy", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], AppPoolListComponent.prototype, "itemSelected", void 0);
    AppPoolListComponent = __decorate([
        core_1.Component({
            selector: 'app-pools',
            template: "\n        <loading *ngIf=\"!_appPools && !lazy\"></loading>\n        <div>\n            <button [class.background-active]=\"newAppPool.opened\" (click)=\"newAppPool.toggle()\">Create Application Pool <i class=\"fa fa-caret-down\"></i></button>\n            <selector #newAppPool class=\"container-fluid\">\n                <new-app-pool (created)=\"newAppPool.close()\" (cancel)=\"newAppPool.close()\"></new-app-pool>\n            </selector>\n        </div>\n        <br/>\n        <app-pool-list *ngIf=\"_appPools\" [model]=\"_appPools\" (itemSelected)=\"onItemClicked($event)\"></app-pool-list>\n    ",
            styles: ["\n        br {\n            margin-top: 30px;\n        }\n    "]
        }),
        __param(0, core_1.Inject("AppPoolsService")),
        __metadata("design:paramtypes", [app_pools_service_1.AppPoolsService,
            router_1.Router])
    ], AppPoolListComponent);
    return AppPoolListComponent;
}());
exports.AppPoolListComponent = AppPoolListComponent;
//# sourceMappingURL=app-pool-list.component.js.map