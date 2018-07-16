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
var AutoFocus = /** @class */ (function () {
    function AutoFocus(_renderer, _el) {
        this._renderer = _renderer;
        this._el = _el;
    }
    AutoFocus.prototype.ngOnInit = function () {
        var _this = this;
        this._renderer.invokeElementMethod(this._el.nativeElement, 'focus', []);
        if (this._el.nativeElement.select) {
            setTimeout(function () {
                _this._renderer.invokeElementMethod(_this._el.nativeElement, 'select', []);
            }, 1);
        }
    };
    AutoFocus = __decorate([
        core_1.Directive({
            selector: '[autofocus]'
        }),
        __metadata("design:paramtypes", [core_1.Renderer, core_1.ElementRef])
    ], AutoFocus);
    return AutoFocus;
}());
exports.AutoFocus = AutoFocus;
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
                AutoFocus
            ],
            declarations: [
                AutoFocus
            ]
        })
    ], Module);
    return Module;
}());
exports.Module = Module;
//# sourceMappingURL=focus.js.map