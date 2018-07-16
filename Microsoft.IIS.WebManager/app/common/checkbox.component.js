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
var CheckBoxComponent = /** @class */ (function () {
    function CheckBoxComponent() {
        this.modelChange = new core_1.EventEmitter();
        this.modelChanged = new core_1.EventEmitter();
    }
    CheckBoxComponent.prototype.updateData = function (event) {
        if (this.disabled) {
            return;
        }
        this.model = event;
        this.modelChange.emit(event);
        this.modelChanged.emit();
    };
    CheckBoxComponent.prototype.labelClick = function () {
        this.updateData(!this.model);
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], CheckBoxComponent.prototype, "model", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], CheckBoxComponent.prototype, "disabled", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", Object)
    ], CheckBoxComponent.prototype, "modelChange", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", Object)
    ], CheckBoxComponent.prototype, "modelChanged", void 0);
    CheckBoxComponent = __decorate([
        core_1.Component({
            selector: 'checkbox2',
            styles: ["\n.checkbox-revamped {\n    display: inline-block;\n}\n\ninput[type=checkbox].revamped {\n    width     : 14px;\n    margin    : 0;\n    padding   : 0;\n    opacity   : 0;\n    position  : relative;\n    cursor    : pointer;\n}\n\ninput[type=checkbox].revamped + label {\n    display      : inline;\n    margin       : 0px;\n    margin-left  : -18px;\n    line-height  : 18px;\n    padding      : 0px;\n    cursor       : pointer;\n}\n\ninput[type=checkbox].revamped + label > span:first-of-type {\n    display          : inline-block;\n    width            : 18px;\n    height           : 18px;\n    margin-right     : 3px;\n    vertical-align   : bottom;\n    border-style     : solid;\n    border-width     : 1px;\n}\n\n\ninput[type=checkbox].revamped:checked + label > span:first-of-type:before {\n    content     : '\u2713';\n    display     : block;\n    width       : 16px;\n    font-size   : 15px;\n    line-height : 1em;\n    text-align  : center;\n    font-weight : bold;\n}\n\ninput[type=checkbox][disabled] + label {\n    cursor           : default;\n}\n\nlabel {\n    font-weight : normal;\n}\n    "],
            template: "\n<div class=\"checkbox-revamped\">\n    <input type=\"checkbox\" [disabled]=\"disabled ? true: null\" class=\"revamped\" [ngModel]=\"model\" (ngModelChange)=\"updateData($event)\" />\n    <label (click)=\"labelClick()\">\n        <span class=\"color-active border-color background-normal\" [attr.disabled]=\"disabled ? true: null\"><span></span></span>\n        <ng-content></ng-content>\n    </label>\n</div>\n"
        })
    ], CheckBoxComponent);
    return CheckBoxComponent;
}());
exports.CheckBoxComponent = CheckBoxComponent;
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
                CheckBoxComponent
            ],
            declarations: [
                CheckBoxComponent
            ]
        })
    ], Module);
    return Module;
}());
exports.Module = Module;
//# sourceMappingURL=checkbox.component.js.map