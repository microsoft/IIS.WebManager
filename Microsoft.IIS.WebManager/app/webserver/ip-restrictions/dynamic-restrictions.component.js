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
var ip_restrictions_1 = require("./ip-restrictions");
var DynamicRestrictionsComponent = /** @class */ (function () {
    function DynamicRestrictionsComponent() {
        this.modelChange = new core_1.EventEmitter();
    }
    DynamicRestrictionsComponent.prototype.onModelChanged = function () {
        this.modelChange.emit(this.model);
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", ip_restrictions_1.IpRestrictions)
    ], DynamicRestrictionsComponent.prototype, "model", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", Object)
    ], DynamicRestrictionsComponent.prototype, "modelChange", void 0);
    DynamicRestrictionsComponent = __decorate([
        core_1.Component({
            selector: 'dynamic-restrictions',
            template: "\n        <div class=\"block\">\n            <fieldset class=\"inline-block\">\n                <label>Restrict Concurrent Requests</label>\n                <switch class=\"block\" [(model)]=\"model.deny_by_concurrent_requests.enabled\" (modelChanged)=\"onModelChanged()\">{{model.deny_by_concurrent_requests.enabled ? \"Yes\" : \"No\"}}</switch>\n            </fieldset>\n            <fieldset class=\"inline-block\" *ngIf=\"model.deny_by_concurrent_requests.enabled\">\n                <label>Max Concurrent Requests</label>\n                <input class=\"form-control\" type=\"number\" required [(ngModel)]=\"model.deny_by_concurrent_requests.max_concurrent_requests\" throttle (modelChanged)=\"onModelChanged()\" />\n            </fieldset>\n        </div>\n\n        <div class=\"block\">\n            <fieldset class=\"inline-block\">\n                <label>Restrict Request Rate</label>\n                <switch class=\"block\" [(model)]=\"model.deny_by_request_rate.enabled\" (modelChanged)=\"onModelChanged()\">{{model.deny_by_request_rate.enabled ? \"Yes\" : \"No\"}}</switch>\n            </fieldset>\n            <fieldset class=\"inline-block\">\n                <fieldset class=\"inline-block\" *ngIf=\"model.deny_by_request_rate.enabled\">\n                    <label>Max Requests</label>\n                    <input class=\"form-control\" type=\"number\" required [(ngModel)]=\"model.deny_by_request_rate.max_requests\" throttle (modelChanged)=\"onModelChanged()\" />\n                </fieldset>\n                <fieldset class=\"inline-block\" *ngIf=\"model.deny_by_request_rate.enabled\">\n                    <label>Per Time Period<span class=\"units\"> (ms)</span></label>\n                    <input class=\"form-control\" type=\"number\" required [(ngModel)]=\"model.deny_by_request_rate.time_period\" throttle (modelChanged)=\"onModelChanged()\" />\n                </fieldset>\n            </fieldset>\n        </div>\n\n        <fieldset>\n            <label>Log Only When Denied</label>\n            <switch class=\"block\" [(model)]=\"model.logging_only_mode\" (modelChanged)=\"onModelChanged()\">{{model.logging_only_mode ? \"Yes\" : \"No\"}}</switch>\n        </fieldset>\n    ",
            styles: ["\n        .block > .inline-block:first-of-type {\n            width: 250px;\n        } \n    "]
        })
    ], DynamicRestrictionsComponent);
    return DynamicRestrictionsComponent;
}());
exports.DynamicRestrictionsComponent = DynamicRestrictionsComponent;
//# sourceMappingURL=dynamic-restrictions.component.js.map