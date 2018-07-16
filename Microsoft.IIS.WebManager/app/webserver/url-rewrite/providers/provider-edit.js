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
var url_rewrite_service_1 = require("../service/url-rewrite.service");
var url_rewrite_1 = require("../url-rewrite");
var ProviderEditComponent = /** @class */ (function () {
    function ProviderEditComponent(_svc) {
        this._svc = _svc;
        this.cancel = new core_1.EventEmitter();
        this.save = new core_1.EventEmitter();
    }
    ProviderEditComponent.prototype.isValid = function () {
        return !!this.provider.name &&
            !!this.provider.type &&
            !this.provider.settings.find(function (setting) { return !setting.name || !setting.value; });
    };
    ProviderEditComponent.prototype.add = function () {
        var setting = new url_rewrite_1.ProviderSetting();
        var name = "New Setting";
        setting.name = name;
        var i = 1;
        while (this.provider.settings.find(function (s) { return s.name.toLocaleLowerCase() == setting.name.toLocaleLowerCase(); })) {
            setting.name = name + " " + (i++);
        }
        this._newSetting = setting;
    };
    ProviderEditComponent.prototype.onDelete = function (index) {
        this.provider.settings.splice(index, 1);
    };
    ProviderEditComponent.prototype.onDiscard = function () {
        this.cancel.emit();
    };
    ProviderEditComponent.prototype.onOk = function () {
        this.save.emit(this.provider);
    };
    ProviderEditComponent.prototype.saveNew = function (setting) {
        this.provider.settings.push(setting);
        this._newSetting = null;
    };
    ProviderEditComponent.prototype.discardNew = function () {
        this._newSetting = null;
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", url_rewrite_1.Provider)
    ], ProviderEditComponent.prototype, "provider", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], ProviderEditComponent.prototype, "cancel", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], ProviderEditComponent.prototype, "save", void 0);
    ProviderEditComponent = __decorate([
        core_1.Component({
            selector: 'provider-edit',
            template: "\n        <div *ngIf=\"provider\">\n            <fieldset>\n                <label>Name</label>\n                <input type=\"text\" required class=\"form-control name\" [(ngModel)]=\"provider.name\" />\n            </fieldset>\n            <fieldset>\n                <label>Type</label>\n                <input type=\"text\" required class=\"form-control name\" [(ngModel)]=\"provider.type\" />\n            </fieldset>\n\n            <button (click)=\"add()\" class=\"create\"><span>Add Setting</span></button>\n            <div class=\"container-fluid\">\n                <div class=\"row hidden-xs border-active grid-list-header\">\n                    <label class=\"col-xs-6 col-sm-4\">Name</label>\n                    <label class=\"col-xs-6 col-sm-4\">Value</label>\n                </div>\n            </div>\n\n            <ul class=\"grid-list container-fluid\">\n                <li *ngIf=\"_newSetting\">\n                    <provider-setting-edit [setting]=\"_newSetting\" (save)=\"saveNew($event)\" (cancel)=\"discardNew()\"></provider-setting-edit>\n                </li>\n                <li *ngFor=\"let setting of provider.settings\">\n                    <provider-setting [setting]=\"setting\" (delete)=\"onDelete(i)\"></provider-setting>\n                </li>\n            </ul>\n\n            <p class=\"pull-right\">\n                <button [disabled]=\"!isValid()\" (click)=\"onOk()\" class=\"ok\">OK</button>\n                <button (click)=\"onDiscard()\" class=\"cancel\">Cancel</button>\n            </p>\n        </div>\n    ",
            styles: ["\n        p {\n            margin: 20px 0;\n        }\n\n        .create {\n            margin-top: 30px;\n        }\n    "]
        }),
        __metadata("design:paramtypes", [url_rewrite_service_1.UrlRewriteService])
    ], ProviderEditComponent);
    return ProviderEditComponent;
}());
exports.ProviderEditComponent = ProviderEditComponent;
//# sourceMappingURL=provider-edit.js.map