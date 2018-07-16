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
var static_content_1 = require("./static-content");
var ClientCacheComponent = /** @class */ (function () {
    function ClientCacheComponent() {
        this.modelChange = new core_1.EventEmitter();
    }
    ClientCacheComponent.prototype.ngOnInit = function () {
        this._useCustom = !!this.model.control_custom;
    };
    ClientCacheComponent.prototype.onModelChanged = function () {
        this.modelChange.emit(this.model);
    };
    ClientCacheComponent.prototype.onCustom = function () {
        if (!this._useCustom) {
            this._cacheCustom = this.model.control_custom;
            this.model.control_custom = "";
            this.onModelChanged();
        }
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", static_content_1.ClientCache)
    ], ClientCacheComponent.prototype, "model", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], ClientCacheComponent.prototype, "locked", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", Object)
    ], ClientCacheComponent.prototype, "modelChange", void 0);
    ClientCacheComponent = __decorate([
        core_1.Component({
            selector: 'client-cache',
            template: "\n        <fieldset>\n            <label>E-Tag</label>\n            <switch class=\"block\" [disabled]=\"locked\" [(model)]=\"model.set_e_tag\" (modelChanged)=\"onModelChanged()\">{{model.set_e_tag ? \"On\" : \"Off\"}}</switch>\n        </fieldset>\n        <fieldset>\n            <label>Cache-Control</label>\n            <enum [disabled]=\"locked\" [(model)]=\"model.control_mode\" (modelChanged)=\"onModelChanged()\">\n                <field name=\"Not Set\" value=\"no_control\"></field>\n                <field name=\"Disabled\" value=\"disable_cache\"></field>\n                <field name=\"Max-Age\" value=\"use_max_age\"></field>\n                <field name=\"Expires\" value=\"use_expires\"></field>\n            </enum>\n        </fieldset>\n        <fieldset [hidden]=\"model.control_mode !== 'use_max_age'\">\n            <label>Max Age <span class=\"units\"> (minutes)</span></label>\n            <input class=\"form-control\" type=\"number\" [disabled]=\"locked\" [(ngModel)]=\"model.max_age\" (modelChanged)=\"onModelChanged()\" throttle />\n        </fieldset>\n        <fieldset [hidden]=\"model.control_mode !== 'use_expires'\">\n            <label>Expiration Date</label>\n            <input class=\"form-control path\" type=\"text\" [disabled]=\"locked\" [(ngModel)]=\"model.http_expires\" (modelChanged)=\"onModelChanged()\" throttle />\n        </fieldset>\n        <fieldset class=\"inline-block pull-left\">\n            <label>Custom Cache-Control</label>\n            <switch [(model)]=\"_useCustom\" (modelChanged)=\"onCustom()\">{{_useCustom ? \"On\" : \"Off\"}}</switch>\n        </fieldset>\n        <fieldset *ngIf=\"_useCustom\" class=\"fill\">\n            <label>&nbsp;</label>\n            <input class=\"form-control name\" type=\"text\" [disabled]=\"locked\" [(ngModel)]=\"model.control_custom\" (modelChanged)=\"onModelChanged()\" throttle />\n        </fieldset>\n    ",
            styles: ["\n        .name {\n            min-width: 200px;\n        }\n    "]
        })
    ], ClientCacheComponent);
    return ClientCacheComponent;
}());
exports.ClientCacheComponent = ClientCacheComponent;
//# sourceMappingURL=client-cache.component.js.map