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
var SwitchComponent = /** @class */ (function () {
    function SwitchComponent() {
        this.auto = true;
        this.modelChange = new core_1.EventEmitter();
        this.modelChanged = new core_1.EventEmitter();
    }
    SwitchComponent.prototype.ngOnChanges = function () {
        if (!this.auto) {
            this._checkbox.nativeElement.checked = this.model;
        }
    };
    SwitchComponent.prototype.updateData = function (event) {
        if (!this.auto) {
            this.model = !event;
            this._checkbox.nativeElement.checked = this.model;
            this.modelChanged.emit();
            return;
        }
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
    SwitchComponent.prototype.toBool = function () {
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
    ], SwitchComponent.prototype, "on", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], SwitchComponent.prototype, "off", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], SwitchComponent.prototype, "disabled", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], SwitchComponent.prototype, "auto", void 0);
    __decorate([
        core_1.Input('model'),
        __metadata("design:type", Object)
    ], SwitchComponent.prototype, "model", void 0);
    __decorate([
        core_1.Output('modelChange'),
        __metadata("design:type", Object)
    ], SwitchComponent.prototype, "modelChange", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", Object)
    ], SwitchComponent.prototype, "modelChanged", void 0);
    __decorate([
        core_1.ViewChild('checkbox'),
        __metadata("design:type", core_1.ElementRef)
    ], SwitchComponent.prototype, "_checkbox", void 0);
    SwitchComponent = __decorate([
        core_1.Component({
            selector: 'switch',
            styles: ["\n        .switch {\n\t        position: relative;\n\t        display: inline-block;\n\t        vertical-align: top;\n\t        width: 94px;\n\t        height: 34px;\n\t        cursor: pointer;\n        }\n\n        .switch-label {\n            display:inline-block;\n            margin-right: 5px;\n        }\n\n        .switch-input[disabled] {\n            height: 500px;\n        }\n\n        .switch-input {\n\t        position: absolute;\n\t        top: 0;\n\t        left: 0;\n\t        opacity: 0;\n        }\n        .switch-content {\n\t        position: relative;\n\t        display: block;\n\t        height: inherit;\n\t        font-size: 12px;\n\t        text-transform: uppercase;\n\t        border-radius: inherit;\n            border-style: solid;\n            border-width: 1px;\n        }\n        .switch-content:before, .switch-content:after {\n\t        position: absolute;\n\t        top: 50%;\n\t        margin-top: -.5em;\n\t        line-height: 1;\n\t        -webkit-transition: inherit;\n\t        -moz-transition: inherit;\n\t        -o-transition: inherit;\n\t        transition: inherit;\n        }\n        .switch-content:before {\n\t        content: attr(data-off);\n\t        right: 11px;\n\t        color: #a94442;\n        }\n        .switch-content:after {\n\t        content: attr(data-on);\n\t        left: 11px;\n\t        color: #3c763d;\n\t        opacity: 0;\n        }\n        .switch-fill {\n            width: 0;\n\t        -webkit-transition: inherit;\n\t        -moz-transition: inherit;\n\t        -o-transition: inherit;\n\t        transition: inherit;\n\n            height: 28px;\n            position: absolute;\n            left: 2px;\n            top: 2px;\n        }\n        .switch-input:checked ~ .switch-content > .switch-fill {\n            width: 66px;\n        }\n        .switch-input:checked ~ .switch-content:before {\n\t        opacity: 0;\n        }\n        .switch-input:checked ~ .switch-content:after {\n\t        opacity: 1;\n        }\n        .switch-handle {\n\t        position: absolute;\n\t        top: 3px;\n\t        left: 3px;\n\t        width: 20px;\n\t        height: 28px;\n            border-style: solid;\n            border-width: 2px;\n        }\n        .switch-handle:before {\n\t        content: \"\";\n\t        position: absolute;\n\t        top: 50%;\n\t        left: 50%;\n\t        margin: -6px 0 0 -6px;\n\t        width: 12px;\n\t        height: 12px;\n        }\n        .switch-input:checked ~ .switch-handle {\n\t        left: 71px;\n        }\n        .switch-container {\n            display: inline-block;\n            height: 34px;\n        }\n        .switch-content, .switch-handle {\n\t        transition:             All 0.3s ease;\n\t        -webkit-transition:     All 0.3s ease;\n\t        -moz-transition:        All 0.3s ease;\n\t        -o-transition:          All 0.3s ease;\n        }\n\n        .switch-line {\n            display:inline-block;\n            vertical-align:bottom;\n            line-height:34px;\n        }\n    "],
            template: "\n        <div class=\"switch-container\" [attr.disabled]=\"disabled ? true : null\">\n            <label class=\"switch\">\n                <input #checkbox class=\"switch-input\" type=\"checkbox\"  [ngModel]=\"toBool()\" (ngModelChange)=\"updateData($event)\"/>\n                <span class=\"switch-content border-color background-normal\" ><div class=\"switch-fill background-active\"></div></span>\n                <span class=\"switch-handle border-active background-normal\"></span>\n            </label>\n        </div>\n        <div class=\"switch-line\"><ng-content></ng-content></div>\n    ",
            exportAs: 'switchVal'
        })
    ], SwitchComponent);
    return SwitchComponent;
}());
exports.SwitchComponent = SwitchComponent;
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
                SwitchComponent
            ],
            declarations: [
                SwitchComponent
            ]
        })
    ], Module);
    return Module;
}());
exports.Module = Module;
//# sourceMappingURL=switch.component.js.map