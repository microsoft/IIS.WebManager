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
var url_rewrite_1 = require("../url-rewrite");
var SettingComponent = /** @class */ (function () {
    function SettingComponent() {
        this.deleteEvent = new core_1.EventEmitter();
    }
    SettingComponent.prototype.ngOnChanges = function (changes) {
        if (changes["setting"]) {
            this._original = JSON.parse(JSON.stringify(changes["setting"].currentValue));
        }
    };
    SettingComponent.prototype.edit = function () {
        this._editing = true;
    };
    SettingComponent.prototype.onSave = function () {
        this._editing = false;
        this._original = JSON.parse(JSON.stringify(this.setting));
    };
    SettingComponent.prototype.onCancel = function () {
        this._editing = false;
        this.setting = JSON.parse(JSON.stringify(this._original));
    };
    SettingComponent.prototype.delete = function () {
        this.deleteEvent.next();
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", url_rewrite_1.ProviderSetting)
    ], SettingComponent.prototype, "setting", void 0);
    __decorate([
        core_1.Output('delete'),
        __metadata("design:type", core_1.EventEmitter)
    ], SettingComponent.prototype, "deleteEvent", void 0);
    SettingComponent = __decorate([
        core_1.Component({
            selector: 'provider-setting',
            template: "\n        <div *ngIf=\"setting && !_editing\" class=\"grid-item row\" [class.background-selected]=\"_editing\" (dblclick)=\"edit()\">\n            <div class=\"col-xs-6 col-sm-4 valign\">\n                {{setting.name}}\n            </div>\n            <div class=\"col-xs-6 col-sm-4 valign\">\n                {{setting.value}}\n            </div>\n            <div class=\"actions\">\n                <div class=\"action-selector\">\n                    <button title=\"More\" (click)=\"selector.toggle()\" (dblclick)=\"$event.preventDefault()\" [class.background-active]=\"(selector && selector.opened) || false\">\n                        <i class=\"fa fa-ellipsis-h\"></i>\n                    </button>\n                    <selector #selector [right]=\"true\">\n                        <ul>\n                            <li><button #menuButton class=\"edit\" title=\"Edit\" (click)=\"edit()\">Edit</button></li>\n                            <li><button #menuButton class=\"delete\" title=\"Delete\" (click)=\"delete()\">Delete</button></li>\n                        </ul>\n                    </selector>\n                </div>\n            </div>\n        </div>\n        <provider-setting-edit\n            *ngIf=\"_editing\"\n            [setting]=\"setting\"\n            (save)=\"onSave()\"\n            (cancel)=\"onCancel()\"></provider-setting-edit>\n    "
        })
    ], SettingComponent);
    return SettingComponent;
}());
exports.SettingComponent = SettingComponent;
var SettingEditComponent = /** @class */ (function () {
    function SettingEditComponent() {
        this.cancel = new core_1.EventEmitter();
        this.save = new core_1.EventEmitter();
    }
    SettingEditComponent.prototype.isValid = function () {
        return !!this.setting.name && !!this.setting.value;
    };
    SettingEditComponent.prototype.onDiscard = function () {
        this.cancel.emit();
    };
    SettingEditComponent.prototype.onOk = function () {
        this.save.emit(this.setting);
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", url_rewrite_1.ProviderSetting)
    ], SettingEditComponent.prototype, "setting", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], SettingEditComponent.prototype, "cancel", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], SettingEditComponent.prototype, "save", void 0);
    SettingEditComponent = __decorate([
        core_1.Component({
            selector: 'provider-setting-edit',
            template: "\n        <div *ngIf=\"setting\" class=\"grid-item row background-editing\">\n            <div class=\"actions\">\n                <button class=\"no-border ok\" [disabled]=\"!isValid()\" title=\"Ok\" (click)=\"onOk()\"></button>\n                <button class=\"no-border cancel\" title=\"Cancel\" (click)=\"onDiscard()\"></button>\n            </div>\n            <fieldset>\n                <label>Name</label>\n                <input type=\"text\" required class=\"form-control name\" [(ngModel)]=\"setting.name\" />\n            </fieldset>\n            <fieldset>\n                <label>Value</label>\n                <input type=\"text\" required class=\"form-control name\" [(ngModel)]=\"setting.value\" />\n            </fieldset>\n        </div>\n    ",
            styles: ["\n        fieldset {\n            padding-left: 15px;\n            padding-right: 15px;\n        }\n    "]
        })
    ], SettingEditComponent);
    return SettingEditComponent;
}());
exports.SettingEditComponent = SettingEditComponent;
//# sourceMappingURL=setting.component.js.map