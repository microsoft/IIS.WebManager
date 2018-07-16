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
var switch_component_1 = require("./switch.component");
var OverrideModeComponent = /** @class */ (function () {
    function OverrideModeComponent(_eRef) {
        this._eRef = _eRef;
        this.modelChanged = new core_1.EventEmitter();
        this.revert = new core_1.EventEmitter();
        this._focused = false;
        this._entered = false;
        this._doubleClick = false;
    }
    OverrideModeComponent.prototype.updateData = function (evt) {
        this.metadata.override_mode = evt;
        this.metadata.override_mode_effective = evt;
        this.modelChanged.emit();
    };
    OverrideModeComponent.prototype.enter = function () {
        this._entered = true;
    };
    OverrideModeComponent.prototype.leave = function () {
        this._entered = false;
    };
    OverrideModeComponent.prototype.onClick = function () {
        if (this._doubleClick) {
            this.reset();
        }
        else {
            this._focused = true;
            this._doubleClick = true;
        }
        return true;
    };
    OverrideModeComponent.prototype.onRevert = function () {
        this.revert.emit(null);
    };
    OverrideModeComponent.prototype.docClick = function (evt) {
        if (!this._focused) {
            return;
        }
        if (!evt || !evt._overrideMode) {
            this.reset();
        }
    };
    OverrideModeComponent.prototype.insideClick = function (evt) {
        evt._overrideMode = true;
    };
    OverrideModeComponent.prototype.blur = function () {
        this.reset();
    };
    OverrideModeComponent.prototype.menuClasses = function () {
        return {
            "border-warning": this.metadata.is_locked,
            "border-active": !(this.metadata.is_locked)
        };
    };
    OverrideModeComponent.prototype.reset = function () {
        this._focused = false;
        this._doubleClick = false;
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], OverrideModeComponent.prototype, "metadata", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], OverrideModeComponent.prototype, "scope", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", Object)
    ], OverrideModeComponent.prototype, "modelChanged", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", Object)
    ], OverrideModeComponent.prototype, "revert", void 0);
    OverrideModeComponent = __decorate([
        core_1.Component({
            selector: 'override-mode',
            styles: ["\n        #root {\n            position: relative;\n        }\n\n        #menu {\n            position: absolute;\n            top: 32px;\n            left: -100px;\n            padding: 5px;\n            border-style: solid;\n            border-width: 1px;\n            z-index: 11;\n            right: 0;\n        }\n\n        span {\n            text-transform: capitalize;\n        }\n\n        #menu button {\n            font-size: 100%;\n        }\n\n        fieldset:last-of-type {\n            padding-bottom: 0;\n        }\n    "],
            template: "\n        <div id=\"root\">\n            <!-- Override mode -->\n            <button class=\"no-border\" *ngIf=\"!metadata.is_locked\" [class.active]=\"_focused\" (click)=\"onClick()\">\n                <span>{{metadata.override_mode_effective}}</span>\n                Override <i class=\"fa fa-caret-down\"></i>\n            </button>\n            <!-- Locked -->\n            <button enabled class=\"no-border background-warning hover-warning\" *ngIf=\"metadata.is_locked\" [class.active]=\"_focused\" (click)=\"onClick()\">\n                <i class=\"fa fa-lock large left-icon\"></i> Locked\n            </button>\n            <div id=\"menu\" class=\"background-normal\" [ngClass]=\"menuClasses()\" [hidden]=\"!_focused && !(metadata.is_locked && _entered)\">\n                <!-- Override mode -->\n                <div *ngIf=\"!metadata.is_locked\">\n                    <fieldset>\n                        <label>\n                            Permit changes at child level\n                        </label>\n                        <switch class=\"block\" [model]=\"metadata.override_mode_effective\" (modelChange)=\"updateData($event)\" [on]=\"'allow'\" [off]=\"'deny'\">\n                            <span>{{metadata.override_mode_effective}}</span>\n                        </switch>\n                    </fieldset>\n                    <fieldset>\n                        <button *ngIf=\"scope\" class=\"no-border\" [disabled]=\"!metadata.is_local\" title=\"Undo local settings\" (click)=\"onRevert()\">\n                            <i class=\"fa fa-undo red\"></i> Reset to inherited\n                        </button>\n                    </fieldset>\n                </div>\n                <!-- Locked -->\n                <div *ngIf=\"metadata.is_locked\">\n                    <p>\n                        The feature has been locked at the parent level and is not available for editing.\n                        To enable editing, change the override setting of the parent level to 'Allow'.\n                    </p>\n                </div>\n            </div>\n        </div>\n    ",
            host: {
                '(document:click)': 'docClick($event)',
                '(click)': 'insideClick($event)',
                '(mouseenter)': 'enter()',
                '(mouseleave)': 'leave()'
            }
        }),
        __metadata("design:paramtypes", [core_1.ElementRef])
    ], OverrideModeComponent);
    return OverrideModeComponent;
}());
exports.OverrideModeComponent = OverrideModeComponent;
var Module = /** @class */ (function () {
    function Module() {
    }
    Module = __decorate([
        core_1.NgModule({
            imports: [
                forms_1.FormsModule,
                common_1.CommonModule,
                switch_component_1.Module
            ],
            exports: [
                OverrideModeComponent
            ],
            declarations: [
                OverrideModeComponent
            ]
        })
    ], Module);
    return Module;
}());
exports.Module = Module;
//# sourceMappingURL=override-mode.component.js.map