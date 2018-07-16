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
var notification_service_1 = require("../../../notification/notification.service");
var url_rewrite_service_1 = require("../service/url-rewrite.service");
var url_rewrite_1 = require("../url-rewrite");
var ProviderComponent = /** @class */ (function () {
    function ProviderComponent(_service, _notificationService) {
        this._service = _service;
        this._notificationService = _notificationService;
        this.deleteEvent = new core_1.EventEmitter();
        this._editing = false;
    }
    ProviderComponent.prototype.ngOnChanges = function (changes) {
        if (changes["provider"]) {
            this._original = JSON.parse(JSON.stringify(changes["provider"].currentValue));
        }
    };
    ProviderComponent.prototype.edit = function () {
        this._editing = true;
    };
    ProviderComponent.prototype.delete = function () {
        var _this = this;
        this._notificationService.confirm("Delete Provider", "Are you sure you want to delete '" + this.provider.name + "'?")
            .then(function (confirmed) { return confirmed && _this._service.deleteProvider(_this.provider); });
    };
    ProviderComponent.prototype.save = function () {
        var _this = this;
        this._service.saveProvider(this.provider)
            .then(function () { return _this._original = JSON.parse(JSON.stringify(_this.provider)); });
        this._editing = false;
    };
    ProviderComponent.prototype.discard = function () {
        this.provider = JSON.parse(JSON.stringify(this._original));
        this._editing = false;
    };
    ProviderComponent.prototype.copy = function () {
        this._service.copyProvider(this.provider);
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", url_rewrite_1.Provider)
    ], ProviderComponent.prototype, "provider", void 0);
    __decorate([
        core_1.Output('delete'),
        __metadata("design:type", core_1.EventEmitter)
    ], ProviderComponent.prototype, "deleteEvent", void 0);
    ProviderComponent = __decorate([
        core_1.Component({
            selector: 'provider',
            template: "\n        <div *ngIf=\"provider\" class=\"grid-item row\" [class.background-selected]=\"_editing\" (dblclick)=\"edit()\">\n            <div class=\"col-xs-8 col-sm-5 valign\">\n                <span class=\"pointer\" (click)=\"edit()\">{{provider.name}}</span>\n            </div>\n            <div class=\"hidden-xs col-sm-5 valign\">\n                {{provider.type}}\n            </div>\n            <div class=\"actions\">\n                <div class=\"action-selector\">\n                    <button title=\"More\" (click)=\"selector.toggle()\" (dblclick)=\"$event.preventDefault()\" [class.background-active]=\"(selector && selector.opened) || _editing || false\">\n                        <i class=\"fa fa-ellipsis-h\"></i>\n                    </button>\n                    <selector #selector [right]=\"true\">\n                        <ul>\n                            <li><button #menuButton class=\"edit\" title=\"Edit\" (click)=\"edit()\">Edit</button></li>\n                            <li><button #menuButton class=\"delete\" title=\"Delete\" (click)=\"delete()\">Delete</button></li>\n                            <li><button #menuButton class=\"copy\" title=\"Copy\" (click)=\"copy()\">Clone</button></li>\n                        </ul>\n                    </selector>\n                </div>\n            </div>\n        </div>\n        <selector #editSelector [opened]=\"true\" *ngIf=\"_editing\" class=\"container-fluid\" (hide)=\"discard()\">\n           <provider-edit [provider]=\"provider\" (save)=\"save($event)\" (cancel)=\"discard()\"></provider-edit>\n        </selector>\n    "
        }),
        __metadata("design:paramtypes", [url_rewrite_service_1.UrlRewriteService, notification_service_1.NotificationService])
    ], ProviderComponent);
    return ProviderComponent;
}());
exports.ProviderComponent = ProviderComponent;
//# sourceMappingURL=provider.component.js.map