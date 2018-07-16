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
var router_1 = require("@angular/router");
var connect_service_1 = require("./connect.service");
var ConnectionPickerComponent = /** @class */ (function () {
    function ConnectionPickerComponent(_eref, _service, _router) {
        var _this = this;
        this._eref = _eref;
        this._service = _service;
        this._router = _router;
        this._focused = false;
        this._doubleClick = false;
        this._subs = [];
        this._subs.push(this._service.connections.subscribe(function (conns) {
            _this._connections = conns;
        }));
        this._subs.push(this._service.active.subscribe(function (c) {
            _this._active = c;
        }));
    }
    ConnectionPickerComponent.prototype.ngOnDestroy = function () {
        this._subs.forEach(function (s) { return s.unsubscribe(); });
    };
    ConnectionPickerComponent.prototype.currentName = function () {
        if (!this._active) {
            return "Not Connected";
        }
        return this.getDisplayName(this._active);
    };
    ConnectionPickerComponent.prototype.getDisplayName = function (con) {
        return con.displayName || con.hostname();
    };
    ConnectionPickerComponent = __decorate([
        core_1.Component({
            selector: 'connection-picker',
            template: "\n        <a title=\"Manage Servers\" class=\"background-active hover-primary2 nav-height\" [routerLink]=\"[_connections.length > 0 ? '/settings/servers' : '/connect']\">{{currentName()}}</a>\n    ",
            styles: ["\n        a {\n            max-width:300px;\n            vertical-align: middle;\n            display: table-cell;\n            padding: 0 10px;\n        }\n    "]
        }),
        __metadata("design:paramtypes", [core_1.ElementRef,
            connect_service_1.ConnectService,
            router_1.Router])
    ], ConnectionPickerComponent);
    return ConnectionPickerComponent;
}());
exports.ConnectionPickerComponent = ConnectionPickerComponent;
//# sourceMappingURL=connection-picker.component.js.map