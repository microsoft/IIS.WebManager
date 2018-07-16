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
var common_1 = require("@angular/common");
var forms_1 = require("@angular/forms");
var TextToggleComponent = /** @class */ (function () {
    function TextToggleComponent() {
        this.modelChange = new core_1.EventEmitter();
        this.modelChanged = new core_1.EventEmitter();
    }
    TextToggleComponent.prototype.updateData = function (event) {
        this.model = event;
        var emitValue = event;
        if (event && this.on !== undefined) {
            emitValue = this.on;
        }
        else if (!event && this.off !== undefined) {
            emitValue = this.off;
        }
        this.modelChange.emit(emitValue);
        this.modelChanged.emit();
    };
    TextToggleComponent.prototype.toBool = function () {
        if (this.model === undefined || this.model === null) {
            return false;
        }
        if (this.model === this.on) {
            return true;
        }
        if (this.model === this.off) {
            return false;
        }
        return !!this.model;
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], TextToggleComponent.prototype, "on", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], TextToggleComponent.prototype, "off", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], TextToggleComponent.prototype, "onText", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], TextToggleComponent.prototype, "offText", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], TextToggleComponent.prototype, "disabled", void 0);
    __decorate([
        core_1.Input('model'),
        __metadata("design:type", Object)
    ], TextToggleComponent.prototype, "model", void 0);
    __decorate([
        core_1.Output('modelChange'),
        __metadata("design:type", Object)
    ], TextToggleComponent.prototype, "modelChange", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", Object)
    ], TextToggleComponent.prototype, "modelChanged", void 0);
    __decorate([
        core_1.ViewChild('checkbox'),
        __metadata("design:type", core_1.ElementRef)
    ], TextToggleComponent.prototype, "_checkbox", void 0);
    TextToggleComponent = __decorate([
        core_1.Component({
            selector: 'text-toggle',
            styles: ["\n        .text-toggle {\n\t        position: relative;\n\t        display: inline-block;\n\t        vertical-align: top;\n\t        height: 34px;\n\t        cursor: pointer;\n            font-weight: normal;\n            -webkit-user-select: none;\n            -moz-user-select: none;\n            -ms-user-select: none;\n            user-select: none;\n        }\n\n        .toggle-input {\n\t        position: absolute;\n\t        top: 0;\n\t        left: 0;\n\t        opacity: 0;\n        }\n\n        .toggle-container {\n            display: inline-block;\n            height: 34px;\n        }\n    "],
            template: "\n        <div class=\"toggle-container\" [attr.disabled]=\"disabled ? true : null\">\n            <label class=\"text-toggle\">\n                <input #checkbox class=\"toggle-input\" type=\"checkbox\"  [ngModel]=\"toBool()\" (ngModelChange)=\"updateData($event)\"/>\n                <span class=\"color-active\" *ngIf=\"toBool()\">{{onText}}</span>\n                <span class=\"red\" *ngIf=\"!toBool()\">{{offText}}</span>\n            </label>\n        </div>\n    "
        })
    ], TextToggleComponent);
    return TextToggleComponent;
}());
exports.TextToggleComponent = TextToggleComponent;
var Module = /** @class */ (function () {
    function Module() {
    }
    Module = __decorate([
        core_1.NgModule({
            imports: [
                forms_1.FormsModule,
                common_1.CommonModule
            ],
            exports: [
                TextToggleComponent
            ],
            declarations: [
                TextToggleComponent
            ]
        })
    ], Module);
    return Module;
}());
exports.Module = Module;
//# sourceMappingURL=text-toggle.component.js.map