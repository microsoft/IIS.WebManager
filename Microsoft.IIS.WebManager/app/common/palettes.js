"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var forms_1 = require("@angular/forms");
var Palettes = /** @class */ (function () {
    function Palettes() {
    }
    Palettes.prototype.ngOnInit = function () {
        var activePalette = localStorage.getItem("palette");
        if (activePalette) {
            this.changePalette(activePalette);
        }
    };
    Palettes.prototype.changePalette = function (palette) {
        var paletteLink = "";
        switch (palette) {
            case "blue":
                paletteLink = "/themes/themes.blue.css";
                break;
            case "purple":
                paletteLink = "/themes/themes.purple.css";
                break;
            case "black":
                paletteLink = "/themes/themes.black.css";
                break;
            default:
                return;
        }
        localStorage.setItem("palette", palette);
        var head = document.getElementsByTagName('head')[0];
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = paletteLink;
        link.media = 'all';
        head.appendChild(link);
    };
    Palettes = __decorate([
        core_1.Component({
            selector: 'palettes',
            template: "\n<div style=\"background-color:#8b4298;\" class=\"border-antiactive\" (click)=\"changePalette('purple')\"></div>\n<div style=\"background-color:#0077ce;\" class=\"border-antiactive\" (click)=\"changePalette('blue')\"></div>\n<div style=\"background-color:black;\" class=\"border-antiactive\" (click)=\"changePalette('black')\"></div>\n    ",
            styles: ["\ndiv {\n    width: 15px;\n    height: 15px;\n    display: inline-block;\n    vertical-align: middle;\n    margin-top: 19px;\n    margin-right: 5px;\n    border-style: solid;\n    border-width: 1px;\n    cursor: pointer;\n    border-color: white;\n}\n    "],
        })
    ], Palettes);
    return Palettes;
}());
exports.Palettes = Palettes;
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
                Palettes
            ],
            declarations: [
                Palettes
            ]
        })
    ], Module);
    return Module;
}());
exports.Module = Module;
//# sourceMappingURL=palettes.js.map