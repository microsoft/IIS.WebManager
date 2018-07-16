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
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var sort_pipe_1 = require("../common/sort.pipe");
var constants_1 = require("../connect/constants");
var selector_1 = require("../common/selector");
var connect_service_1 = require("../connect/connect.service");
var api_connection_1 = require("../connect/api-connection");
var ServerListComponent = /** @class */ (function () {
    function ServerListComponent(_svc) {
        var _this = this;
        this._svc = _svc;
        this._servers = [];
        this._view = [];
        this._orderBy = new sort_pipe_1.OrderBy();
        this._sortPipe = new sort_pipe_1.SortPipe();
        this._subscriptions = [];
        this._subscriptions.push(this._svc.active.subscribe(function (active) {
            _this._active = active;
            _this.doSort();
        }));
        this._subscriptions.push(this._svc.connections.subscribe(function (connections) {
            _this._servers = connections;
            _this.doSort();
        }));
    }
    ServerListComponent.prototype.ngOnDestroy = function () {
        this._subscriptions.forEach(function (sub) { return sub.unsubscribe(); });
    };
    ServerListComponent.prototype.onNewServer = function () {
        var con = new api_connection_1.ApiConnection(constants_1.Constants.localUrl);
        con.displayName = constants_1.Constants.localDisplayName;
        con.persist = true;
        this._newServer = con;
    };
    ServerListComponent.prototype.onLeaveNewServer = function () {
        this._newServer = null;
    };
    ServerListComponent.prototype.sort = function (field) {
        this._orderBy.sort(field);
        this.doSort();
    };
    ServerListComponent.prototype.doSort = function () {
        var _this = this;
        this._view = this._servers;
        this._sortPipe.transform(this._view, this._orderBy.Field, this._orderBy.Asc, null, true);
        if (!this._orderBy.Field) {
            this._view = this._view.filter(function (c) { return c != _this._active; });
        }
    };
    __decorate([
        core_1.ViewChild(selector_1.Selector),
        __metadata("design:type", selector_1.Selector)
    ], ServerListComponent.prototype, "_selector", void 0);
    ServerListComponent = __decorate([
        core_1.Component({
            selector: 'server-list',
            template: "\n        <div>\n            <button title=\"New Server\" class=\"create\" [attr.disabled]=\"!!_newServer || null\" (click)=\"onNewServer()\"><i class=\"fa fa-plus color-active\"></i><span>Add Server</span></button>\n        </div>\n        <br/>\n        <div class=\"container-fluid hidden-xs\">\n            <div class=\"border-active grid-list-header row\">\n                <label class=\"col-xs-4\" [ngClass]=\"_orderBy.css('displayName')\" (click)=\"sort('displayName')\">Display Name</label>\n                <label class=\"col-sm-6\" [ngClass]=\"_orderBy.css('url')\" (click)=\"sort('url')\">Server Url</label>\n            </div>\n        </div>\n        <ul class=\"container-fluid grid-list\" *ngIf=\"_servers\">\n            <li *ngIf=\"_newServer\" tabindex=\"-1\">\n                <server [model]=\"_newServer\" (leave)=\"onLeaveNewServer()\"></server>\n            </li>\n            <li class=\"hover-editing\" tabindex=\"-1\" *ngIf=\"_active && !_orderBy.Field\">\n                <server [model]=\"_active\"></server>\n            </li>\n            <li class=\"hover-editing\" tabindex=\"-1\" *ngFor=\"let server of _view\">\n                <server [model]=\"server\"></server>\n            </li>\n        </ul>\n    ",
            styles: ["\n        .container-fluid,\n        .row {\n            margin: 0;\n            padding: 0;\n        }\n    "]
        }),
        __metadata("design:paramtypes", [connect_service_1.ConnectService])
    ], ServerListComponent);
    return ServerListComponent;
}());
exports.ServerListComponent = ServerListComponent;
//# sourceMappingURL=server-list.js.map