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
var AutoSize = /** @class */ (function () {
    function AutoSize(_elem) {
        this._elem = _elem;
    }
    AutoSize_1 = AutoSize;
    AutoSize.prototype.onChange = function (input) {
        this.resize();
    };
    AutoSize.prototype.ngOnInit = function () {
        this.resize();
    };
    AutoSize.prototype.resize = function () {
        var elem = this._elem.nativeElement;
        var style = window.getComputedStyle(elem);
        var width = AutoSize_1.getTextWidth(elem.value, style.font);
        var pl = parseInt(style.paddingLeft);
        var pr = parseInt(style.paddingRight);
        var bl = parseInt(style.borderLeftWidth);
        var br = parseInt(style.borderRightWidth);
        var w = (width + pl + pr + bl + br) + 'px';
        elem.style.width = w;
    };
    AutoSize.getTextWidth = function (text, font) {
        // 
        // Use HTNML5 canvas
        var canvas = window['__canvas'] || (window['__canvas'] = document.createElement("canvas"));
        var context = canvas.getContext("2d");
        context.font = font;
        var metrics = context.measureText(text + ' ');
        return parseInt(metrics.width);
    };
    __decorate([
        core_1.HostListener('input', ['$event.target']),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], AutoSize.prototype, "onChange", null);
    AutoSize = AutoSize_1 = __decorate([
        core_1.Directive({
            selector: 'input[autosize]'
        }),
        __metadata("design:paramtypes", [core_1.ElementRef])
    ], AutoSize);
    return AutoSize;
    var AutoSize_1;
}());
exports.AutoSize = AutoSize;
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
                AutoSize
            ],
            declarations: [
                AutoSize
            ]
        })
    ], Module);
    return Module;
}());
exports.Module = Module;
//# sourceMappingURL=autosize.js.map