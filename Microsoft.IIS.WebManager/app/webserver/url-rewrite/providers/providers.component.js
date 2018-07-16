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
var selector_1 = require("../../../common/selector");
var url_rewrite_service_1 = require("../service/url-rewrite.service");
var url_rewrite_1 = require("../url-rewrite");
var ProvidersComponent = /** @class */ (function () {
    function ProvidersComponent(_service) {
        var _this = this;
        this._service = _service;
        this._providers = [];
        this._subscriptions = [];
        this._subscriptions.push(this._service.providersSettings.subscribe(function (settings) { return _this._settings = settings; }));
        this._subscriptions.push(this._service.providers.subscribe(function (r) {
            _this._providers = r;
            _this.initializeNewProvider();
        }));
        this.initializeNewProvider();
    }
    ProvidersComponent.prototype.ngOnDestroy = function () {
        this._subscriptions.forEach(function (sub) { return sub.unsubscribe(); });
    };
    ProvidersComponent.prototype.initializeNewProvider = function () {
        var _this = this;
        this._newProvider = new url_rewrite_1.Provider();
        var name = "New Provider";
        this._newProvider.name = name;
        this._newProvider.type = "";
        this._newProvider.settings = new Array();
        var i = 1;
        while (this._providers.find(function (r) { return r.name.toLocaleLowerCase() == _this._newProvider.name.toLocaleLowerCase(); })) {
            this._newProvider.name = name + " " + i++;
        }
    };
    ProvidersComponent.prototype.saveNew = function () {
        var _this = this;
        this._service.addProvider(this._newProvider)
            .then(function () { return _this._newSelector.close(); });
    };
    ProvidersComponent.prototype.onModelChanged = function () {
        this._service.saveProviders(this._settings);
    };
    ProvidersComponent.prototype.onRevert = function () {
        this._service.revertProviders();
    };
    __decorate([
        core_1.ViewChild(selector_1.Selector),
        __metadata("design:type", selector_1.Selector)
    ], ProvidersComponent.prototype, "_newSelector", void 0);
    ProvidersComponent = __decorate([
        core_1.Component({
            selector: 'providers',
            template: "\n        <error [error]=\"_service.providersError\"></error>\n        <div *ngIf=\"!_service.providersError && _settings\">\n            <override-mode class=\"pull-right\"\n                [metadata]=\"_settings.metadata\"\n                [scope]=\"_settings.scope\"\n                (revert)=\"onRevert()\" \n                (modelChanged)=\"onModelChanged()\"></override-mode>\n            <div>\n                <button [class.background-active]=\"newProvider.opened\" (click)=\"newProvider.toggle()\">Create Provider <i class=\"fa fa-caret-down\"></i></button>\n                <selector #newProvider class=\"container-fluid create\" (hide)=\"initializeNewProvider()\">\n                    <provider-edit [provider]=\"_newProvider\" (save)=\"saveNew()\" (cancel)=\"newProvider.close()\"></provider-edit>\n                </selector>\n            </div>\n\n            <div>\n                <div class=\"container-fluid\">\n                    <div class=\"row hidden-xs border-active grid-list-header\">\n                        <label class=\"col-xs-8 col-sm-5\">Name</label>\n                        <label class=\"col-sm-5\">Type</label>\n                    </div>\n                </div>\n\n                <ul class=\"grid-list container-fluid\">\n                    <li *ngFor=\"let provider of _providers\">\n                        <provider [provider]=\"provider\"></provider>\n                    </li>\n                </ul>\n            </div>\n        </div>\n    "
        }),
        __metadata("design:paramtypes", [url_rewrite_service_1.UrlRewriteService])
    ], ProvidersComponent);
    return ProvidersComponent;
}());
exports.ProvidersComponent = ProvidersComponent;
//# sourceMappingURL=providers.component.js.map