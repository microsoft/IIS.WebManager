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
var request_tracing_1 = require("./request-tracing");
var request_tracing_service_1 = require("./request-tracing.service");
var ProvidersComponent = /** @class */ (function () {
    function ProvidersComponent(_service) {
        this._service = _service;
    }
    ProvidersComponent.prototype.ngOnInit = function () {
        var _this = this;
        this._service.providers.then(function (providers) {
            _this._providers = providers;
        });
    };
    ProvidersComponent.prototype.create = function () {
        var provider = new request_tracing_1.Provider();
        provider.name = "";
        provider.guid = "";
        provider.areas = [];
        this._newProvider = provider;
        this._editing = this._newProvider;
    };
    ProvidersComponent.prototype.edit = function (p) {
        this._editing = p;
    };
    ProvidersComponent.prototype.close = function () {
        this._newProvider = null;
        this._editing = null;
    };
    ProvidersComponent.prototype.sort = function (field) {
        this._orderByAsc = (field == this._orderBy) ? !this._orderByAsc : true;
        this._orderBy = field;
    };
    ProvidersComponent.prototype.css = function (field) {
        if (this._orderBy == field) {
            return {
                "orderby": true,
                "desc": !this._orderByAsc
            };
        }
        return {};
    };
    ProvidersComponent = __decorate([
        core_1.Component({
            selector: 'provider-list',
            template: "\n        <div *ngIf=\"_providers\">\n            <button class=\"create\" (click)=\"create()\" [class.inactive]=\"_editing\"><i class=\"fa fa-plus color-active\"></i><span>Create Provider</span></button>\n            <div class=\"container-fluid\">\n                <div class=\"hidden-xs border-active grid-list-header row\" [hidden]=\"_providers.length < 1\">\n                    <label [ngClass]=\"css('name')\" (click)=\"sort('name')\">Name</label>\n                </div>\n                <div class=\"grid-list\">\n                    <provider *ngIf=\"_newProvider\" [model]=\"_newProvider\" (close)=\"close()\"></provider>\n                    <provider *ngFor=\"let p of _providers | orderby: _orderBy: _orderByAsc;\" \n                                [model]=\"p\" \n                                [readonly]=\"_editing && p != _editing\" \n                                (edit)=\"edit(p)\" (close)=\"close()\">\n                    </provider>\n                    <br /><br />\n                </div>\n            </div>\n        </div>\n    "
        }),
        __metadata("design:paramtypes", [request_tracing_service_1.RequestTracingService])
    ], ProvidersComponent);
    return ProvidersComponent;
}());
exports.ProvidersComponent = ProvidersComponent;
//# sourceMappingURL=provider-list.component.js.map