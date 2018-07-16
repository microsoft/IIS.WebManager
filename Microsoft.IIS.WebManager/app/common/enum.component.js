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
var EnumComponent = /** @class */ (function () {
    function EnumComponent() {
        this.fields = [];
        this.modelChange = new core_1.EventEmitter();
        this.modelChanged = new core_1.EventEmitter();
    }
    EnumComponent.prototype.add = function (field) {
        this.fields.push(field);
    };
    EnumComponent.prototype.select = function (field) {
        this.model = field.value;
        this.modelChange.emit(this.model);
        this.modelChanged.emit();
    };
    __decorate([
        core_1.Input('model'),
        __metadata("design:type", Object)
    ], EnumComponent.prototype, "model", void 0);
    __decorate([
        core_1.Input('disabled'),
        __metadata("design:type", Boolean)
    ], EnumComponent.prototype, "disabled", void 0);
    __decorate([
        core_1.Output('modelChange'),
        __metadata("design:type", Object)
    ], EnumComponent.prototype, "modelChange", void 0);
    __decorate([
        core_1.Output('modelChanged'),
        __metadata("design:type", Object)
    ], EnumComponent.prototype, "modelChanged", void 0);
    EnumComponent = __decorate([
        core_1.Component({
            selector: 'enum',
            template: "\n        <ul [attr.disabled]=\"disabled ? true : null\">\n            <li *ngFor=\"let field of fields\" [class.background-active]=\"'' + model == field.value\" [attr.title]=\"field.title || null\" [hidden]=\"field.hidden\" (click)=\"select(field)\">\n                {{field.name}}\n            </li>\n        </ul>\n    ",
            styles: ["\n        ul {\n            padding: 0;\n            margin: 0;\n        }\n\n        li {\n            float: left;\n            cursor: pointer;\n            padding: 7px;\n            margin-right: 5px;\n            text-align: center;\n            min-width: 45px;\n        }\n\n        li:last-of-type {\n            margin-right: 0;\n        }\n    "]
        })
    ], EnumComponent);
    return EnumComponent;
}());
exports.EnumComponent = EnumComponent;
var FieldComponent = /** @class */ (function () {
    function FieldComponent(parent) {
        this.hidden = false;
        parent.add(this);
    }
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], FieldComponent.prototype, "name", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], FieldComponent.prototype, "value", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], FieldComponent.prototype, "hidden", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], FieldComponent.prototype, "title", void 0);
    FieldComponent = __decorate([
        core_1.Component({
            selector: 'field',
            template: "\n    <div>\n        <ng-content></ng-content>\n    </div>\n"
        }),
        __metadata("design:paramtypes", [EnumComponent])
    ], FieldComponent);
    return FieldComponent;
}());
exports.FieldComponent = FieldComponent;
exports.ENUM = [
    EnumComponent,
    FieldComponent
];
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
                exports.ENUM
            ],
            declarations: [
                exports.ENUM
            ]
        })
    ], Module);
    return Module;
}());
exports.Module = Module;
//# sourceMappingURL=enum.component.js.map