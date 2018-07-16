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
var forms_1 = require("@angular/forms");
var common_1 = require("@angular/common");
var forms_2 = require("@angular/forms");
var EqualValidator = /** @class */ (function () {
    function EqualValidator() {
        var _this = this;
        this.validator = function (c) {
            return c.value != _this.validateEqual ? { "equal": _this.validateEqual } : null;
        };
    }
    EqualValidator_1 = EqualValidator;
    EqualValidator.prototype.validate = function (c) {
        return this.validator(c);
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], EqualValidator.prototype, "validateEqual", void 0);
    EqualValidator = EqualValidator_1 = __decorate([
        core_1.Directive({
            selector: '[validateEqual][ngModel]',
            providers: [
                { provide: forms_1.NG_VALIDATORS, useExisting: core_1.forwardRef(function () { return EqualValidator_1; }), multi: true }
            ]
        })
    ], EqualValidator);
    return EqualValidator;
    var EqualValidator_1;
}());
exports.EqualValidator = EqualValidator;
var LateBindValidator = /** @class */ (function () {
    function LateBindValidator() {
        var _this = this;
        this._validator = function (c) {
            return !_this.lateBindValidator || _this.lateBindValidator(c.value);
        };
    }
    LateBindValidator_1 = LateBindValidator;
    LateBindValidator.prototype.validate = function (c) {
        return this._validator(c);
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], LateBindValidator.prototype, "lateBindValidator", void 0);
    LateBindValidator = LateBindValidator_1 = __decorate([
        core_1.Directive({
            selector: '[lateBindValidator][ngModel]',
            providers: [
                { provide: forms_1.NG_VALIDATORS, useExisting: core_1.forwardRef(function () { return LateBindValidator_1; }), multi: true }
            ]
        }),
        __metadata("design:paramtypes", [])
    ], LateBindValidator);
    return LateBindValidator;
    var LateBindValidator_1;
}());
exports.LateBindValidator = LateBindValidator;
exports.VALIDATOR_DIRECTIVES = [
    EqualValidator,
    LateBindValidator
];
var Module = /** @class */ (function () {
    function Module() {
    }
    Module = __decorate([
        core_1.NgModule({
            imports: [
                forms_2.FormsModule,
                common_1.CommonModule
            ],
            exports: [
                exports.VALIDATOR_DIRECTIVES
            ],
            declarations: [
                exports.VALIDATOR_DIRECTIVES
            ]
        })
    ], Module);
    return Module;
}());
exports.Module = Module;
//# sourceMappingURL=validators.js.map