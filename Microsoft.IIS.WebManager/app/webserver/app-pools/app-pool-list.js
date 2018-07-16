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
var sort_pipe_1 = require("../../common/sort.pipe");
var notification_service_1 = require("../../notification/notification.service");
var app_pools_service_1 = require("./app-pools.service");
var app_pool_1 = require("./app-pool");
var AppPoolItem = /** @class */ (function () {
    function AppPoolItem(_router, _service, _notificationService) {
        this._router = _router;
        this._service = _service;
        this._notificationService = _notificationService;
        this.actions = "";
    }
    AppPoolItem.prototype.onDelete = function (e) {
        var _this = this;
        e.stopPropagation();
        this._selector.close();
        this._notificationService.confirm("Delete Application Pool", "Are you sure you want to delete Application Pool '" + this.model.name + "'")
            .then(function (confirmed) { return confirmed && _this._service.delete(_this.model); });
    };
    AppPoolItem.prototype.onEdit = function (e) {
        e.stopPropagation();
        this._selector.close();
        this._router.navigate(['webserver', 'app-pools', this.model.id]);
    };
    AppPoolItem.prototype.onStart = function (e) {
        e.stopPropagation();
        this._selector.close();
        this._service.start(this.model);
    };
    AppPoolItem.prototype.onStop = function (e) {
        e.stopPropagation();
        this._selector.close();
        this._service.stop(this.model);
    };
    AppPoolItem.prototype.onRecycle = function (e) {
        e.stopPropagation();
        this._selector.close();
        this._service.recycle(this.model);
    };
    AppPoolItem.prototype.identity = function () {
        if (!this.model.identity) {
            return "";
        }
        switch (this.model.identity.identity_type) {
            case app_pool_1.ProcessModelIdentityType.LocalSystem:
                return "Local System";
            case app_pool_1.ProcessModelIdentityType.LocalService:
                return "Local Service";
            case app_pool_1.ProcessModelIdentityType.NetworkService:
                return "Network Service";
            case app_pool_1.ProcessModelIdentityType.ApplicationPoolIdentity:
                return "AppPool Identity";
            case app_pool_1.ProcessModelIdentityType.SpecificUser:
                return this.model.identity.username;
            default:
        }
        return "n/a";
    };
    AppPoolItem.prototype.runtimeVer = function () {
        switch (this.model.managed_runtime_version) {
            case "v2.0":
                return ".NET 3.5";
            case "v4.0":
                return ".NET 4.x";
            case "":
                return "None";
            default:
                return this.model.managed_runtime_version;
        }
    };
    AppPoolItem.prototype.allow = function (action) {
        return this.actions.indexOf(action) >= 0;
    };
    AppPoolItem.prototype.started = function () {
        return this.model.status == 'started';
    };
    AppPoolItem.prototype.openSelector = function (e) {
        e.preventDefault();
        this._selector.toggle();
    };
    AppPoolItem.prototype.prevent = function (e) {
        e.preventDefault();
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", app_pool_1.ApplicationPool)
    ], AppPoolItem.prototype, "model", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], AppPoolItem.prototype, "actions", void 0);
    __decorate([
        core_1.ViewChild(selector_1.Selector),
        __metadata("design:type", selector_1.Selector)
    ], AppPoolItem.prototype, "_selector", void 0);
    AppPoolItem = __decorate([
        core_1.Component({
            selector: 'app-pool-item',
            template: "\n    <div *ngIf=\"model\" class=\"grid-item row border-color\">\n        <div class='col-xs-7 col-sm-4 col-md-3 v-align big'>\n            <a class=\"color-normal hover-color-active\" [routerLink]=\"['/webserver/app-pools', model.id]\">{{model.name}}</a>\n        </div>\n        <div class='col-xs-3 col-md-2 v-align'>\n            <span class='status' [ngClass]=\"model.status\">{{model.status}}</span>\n        </div>\n        <div class='col-md-2 hidden-xs hidden-sm v-align capitalize'>\n            <span>{{model.pipeline_mode}}</span>\n        </div>\n        <div class='col-sm-2 hidden-xs v-align'>\n            <span>{{runtimeVer()}}</span>\n        </div>\n        <div class=\"col-lg-2 visible-lg v-align\">\n            {{identity()}}\n        </div>\n        <div class=\"actions\">\n            <div class=\"selector-wrapper\">\n                <button title=\"More\" (click)=\"openSelector($event)\" (dblclick)=\"prevent($event)\" [class.background-active]=\"(_selector && _selector.opened) || false\">\n                    <i class=\"fa fa-ellipsis-h\"></i>\n                </button>\n                <selector [right]=\"true\">\n                    <ul>\n                        <li><button class=\"edit\" title=\"Edit\" *ngIf=\"allow('edit')\" (click)=\"onEdit($event)\">Edit</button></li>\n                        <li><button class=\"refresh\" title=\"Recycle\" *ngIf=\"allow('recycle')\" [attr.disabled]=\"!started() || null\" (click)=\"onRecycle($event)\">Recycle</button></li>\n                        <li><button class=\"start\" title=\"Start\" *ngIf=\"allow('start')\" [attr.disabled]=\"model.status != 'stopped' ? true : null\" (click)=\"onStart($event)\">Start</button></li>\n                        <li><button class=\"stop\" *ngIf=\"allow('stop')\" title=\"Stop\" [attr.disabled]=\"!started() || null\" (click)=\"onStop($event)\">Stop</button></li>\n                        <li><button class=\"delete\" *ngIf=\"allow('delete')\" title=\"Delete\" (click)=\"onDelete($event)\">Delete</button></li>\n                    </ul>\n                </selector>\n            </div>\n        </div>\n    </div>\n    ",
            styles: ["\n        .big {\n            font-size: 16px;\n        }\n\n        .big a {\n            display: inline;\n            background: transparent;\n        }\n\n        span {\n            overflow: hidden;\n            white-space:nowrap;\n        }\n\n        .row {\n            margin: 0;\n        }\n\n        [class*=\"col-\"] {\n            overflow: hidden;\n            white-space: nowrap;\n            text-overflow: ellipsis;\n        }\n\n        .actions ul {\n            margin-bottom: 0;\n        }\n\n        .selector-wrapper {\n            position: relative;\n        }\n\n        .v-align {\n            padding-top: 6px;\n        }\n\n        selector {\n            position:absolute;\n            right:0;\n            top: 32px;\n        }\n\n        selector button {\n            min-width: 125px;\n            width: 100%;\n        }\n    "]
        }),
        __param(1, core_1.Inject("AppPoolsService")),
        __metadata("design:paramtypes", [router_1.Router,
            app_pools_service_1.AppPoolsService,
            notification_service_1.NotificationService])
    ], AppPoolItem);
    return AppPoolItem;
}());
exports.AppPoolItem = AppPoolItem;
var AppPoolList = /** @class */ (function () {
    function AppPoolList(_service, _router) {
        this._service = _service;
        this._router = _router;
        this.actions = "edit,recycle,start,stop,delete";
        this.itemSelected = new core_1.EventEmitter();
        this._orderBy = new sort_pipe_1.OrderBy();
    }
    AppPoolList.prototype.onItemSelected = function (e, pool) {
        if (e.defaultPrevented) {
            return;
        }
        this.itemSelected.next(pool);
    };
    AppPoolList.prototype.onDblClick = function (e, pool) {
        if (e.defaultPrevented) {
            return;
        }
        this._router.navigate(['webserver', 'app-pools', pool.id]);
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Array)
    ], AppPoolList.prototype, "model", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], AppPoolList.prototype, "actions", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], AppPoolList.prototype, "itemSelected", void 0);
    AppPoolList = __decorate([
        core_1.Component({
            selector: 'app-pool-list',
            template: "\n        <div class=\"container-fluid\">\n            <div class=\"hidden-xs border-active grid-list-header row\" [hidden]=\"model.length == 0\">\n                <label class=\"col-xs-7 col-sm-4 col-md-3\" [ngClass]=\"_orderBy.css('name')\" (click)=\"_orderBy.sort('name')\">Name</label>\n                <label class=\"col-xs-3 col-md-2\" [ngClass]=\"_orderBy.css('status')\" (click)=\"_orderBy.sort('status')\">Status</label>\n                <label class=\"col-md-2 hidden-sm\" [ngClass]=\"_orderBy.css('pipeline_mode')\" (click)=\"_orderBy.sort('pipeline_mode')\">Pipeline</label>\n                <label class=\"col-md-2\" [ngClass]=\"_orderBy.css('managed_runtime_version')\" (click)=\"_orderBy.sort('managed_runtime_version')\">.NET Framework</label>\n                <label class=\"col-lg-2 visible-lg\">Identity</label>\n            </div>\n            \n            <ul class=\"grid-list\">\n                <li *ngFor=\"let p of model | orderby: _orderBy.Field: _orderBy.Asc\" (click)=\"onItemSelected($event, p);\" (dblclick)=\"onDblClick($event, p)\" class=\"hover-editing\">\n                    <app-pool-item [model]=\"p\" [actions]=\"actions\"></app-pool-item>\n                </li>\n            </ul>\n        </div>\n    ",
            styles: ["\n        .container-fluid,\n        .row {\n            margin: 0;\n            padding: 0;\n        }\n    "]
        }),
        __param(0, core_1.Inject("AppPoolsService")),
        __metadata("design:paramtypes", [app_pools_service_1.AppPoolsService,
            router_1.Router])
    ], AppPoolList);
    return AppPoolList;
}());
exports.AppPoolList = AppPoolList;
//# sourceMappingURL=app-pool-list.js.map