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
var WarningComponent = /** @class */ (function () {
    function WarningComponent() {
    }
    WarningComponent.prototype.getLines = function () {
        return this.warning.split("\n");
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], WarningComponent.prototype, "warning", void 0);
    WarningComponent = __decorate([
        core_1.Component({
            selector: 'warning',
            styles: ["\n        .warning {\n            padding-left: 45px;\n            padding-right: 45px;\n            min-height: 80px;\n            line-height: 80px;\n            text-align: center;\n            background-color: #ffff7f;\n        }\n        .v-center {\n            text-align: center;\n            line-height: normal;\n            display: inline-block;\n            vertical-align: middle;\n        }\n        .symbol {\n            display: inline-block;\n            font-size: 34px;\n            position: absolute;\n            left: 0;\n            width: 45px;\n            text-align: center;\n        }\n    "],
            template: "\n        <div class=\"warning\" *ngIf=\"warning\">\n            <div class=\"symbol\">\n                <i class=\"fa fa-exclamation\" aria-hidden=\"true\"></i>\n            </div>\n            <span class=\"v-center\">\n                <div *ngFor=\"let line of getLines(_warning)\">\n                    {{line}}\n                </div>\n            </span>\n        </div>\n    "
        })
    ], WarningComponent);
    return WarningComponent;
}());
exports.WarningComponent = WarningComponent;
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
                WarningComponent
            ],
            declarations: [
                WarningComponent
            ]
        })
    ], Module);
    return Module;
}());
exports.Module = Module;
//# sourceMappingURL=warning.component.js.map