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
var api_error_1 = require("../error/api-error");
var SectionLockErrorComponent = /** @class */ (function () {
    function SectionLockErrorComponent() {
    }
    SectionLockErrorComponent = __decorate([
        core_1.Component({
            selector: 'section-locked',
            styles: ["\n        #container {\n            font-size: 16px;\n            margin-bottom: 35px;\n        }\n\n        #lockSymbol {\n            padding:10px;\n            display:inline-block;\n        }\n\n        p {\n            margin-top: 10px;\n            font-size: 14px;\n            width: 100%;\n        }\n    "],
            template: "\n        <div id=\"container\">\n            <div id=\"lockSymbol\" class=\"background-warning\">\n                <i class=\"fa fa-lock large left-icon\"></i> Locked\n            </div>\n            <p>\n                The feature has been locked at the parent level and is not available for editing.\n                To enable editing, change the override setting of the parent level to 'Allow'.\n            </p>\n            <p class=\"color-error\">\n                The feature's settings could not be loaded.\n                This happens when the feature is locked at the current configuration level and the feature's settings have been modified.\n                To fix this, manually remove any local changes to the feature or unlock the feature at the parent level.\n            </p>\n        </div>\n    "
        })
    ], SectionLockErrorComponent);
    return SectionLockErrorComponent;
}());
exports.SectionLockErrorComponent = SectionLockErrorComponent;
var FeatureNotInstalledComponent = /** @class */ (function () {
    function FeatureNotInstalledComponent() {
    }
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], FeatureNotInstalledComponent.prototype, "name", void 0);
    FeatureNotInstalledComponent = __decorate([
        core_1.Component({
            selector: 'feature-not-installed',
            template: "\n        <div id=\"container\">\n            <p>\n                The feature '{{name}}' has not been installed.\n            </p>\n        </div>\n    "
        })
    ], FeatureNotInstalledComponent);
    return FeatureNotInstalledComponent;
}());
exports.FeatureNotInstalledComponent = FeatureNotInstalledComponent;
var ErrorComponent = /** @class */ (function () {
    function ErrorComponent() {
        this.notInstalled = false;
    }
    __decorate([
        core_1.Input(),
        __metadata("design:type", api_error_1.ApiError)
    ], ErrorComponent.prototype, "error", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], ErrorComponent.prototype, "notInstalled", void 0);
    ErrorComponent = __decorate([
        core_1.Component({
            selector: 'error',
            template: "\n        <div *ngIf=\"error\">\n            <div *ngIf=\"error.type === 'SectionLocked'\">\n                <section-locked></section-locked>\n            </div>\n            <div *ngIf=\"notInstalled && error.type === 'FeatureNotInstalled'\">\n                <feature-not-installed [name]=\"error.name\"></feature-not-installed>\n            </div>\n        </div>\n    "
        })
    ], ErrorComponent);
    return ErrorComponent;
}());
exports.ErrorComponent = ErrorComponent;
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
                SectionLockErrorComponent,
                FeatureNotInstalledComponent,
                ErrorComponent
            ],
            declarations: [
                SectionLockErrorComponent,
                FeatureNotInstalledComponent,
                ErrorComponent
            ]
        })
    ], Module);
    return Module;
}());
exports.Module = Module;
//# sourceMappingURL=error.component.js.map