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
var url_rewrite_1 = require("../url-rewrite");
var InboundRuleEditComponent = /** @class */ (function () {
    function InboundRuleEditComponent() {
        this.cancel = new core_1.EventEmitter();
        this.save = new core_1.EventEmitter();
    }
    InboundRuleEditComponent.prototype.isValid = function () {
        return !!this.rule.name && !!this.rule.pattern &&
            (this.rule.action.type != url_rewrite_1.ActionType.CustomResponse || (this.rule.action.status_code !== "" && this.rule.action.sub_status_code !== ""));
    };
    InboundRuleEditComponent.prototype.onDiscard = function () {
        this.cancel.emit();
    };
    InboundRuleEditComponent.prototype.onOk = function () {
        this.save.emit(this.rule);
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", url_rewrite_1.InboundRule)
    ], InboundRuleEditComponent.prototype, "rule", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], InboundRuleEditComponent.prototype, "cancel", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], InboundRuleEditComponent.prototype, "save", void 0);
    InboundRuleEditComponent = __decorate([
        core_1.Component({
            selector: 'inbound-rule-edit',
            template: "\n        <div>\n            <tabs>\n                <tab [name]=\"'Settings'\">\n                    <inbound-rule-settings [rule]=\"rule\"></inbound-rule-settings>\n                </tab>\n                <tab [name]=\"'Action'\">\n                    <inbound-rule-action [rule]=\"rule\"></inbound-rule-action>\n                </tab>\n                <tab [name]=\"'Conditions'\">\n                    <inbound-rule-conditions [rule]=\"rule\"></inbound-rule-conditions>\n                </tab>\n                <tab [name]=\"'Server Variables'\">\n                    <inbound-rule-variables [rule]=\"rule\"></inbound-rule-variables>\n                </tab>\n            </tabs>\n            <p class=\"pull-right\">\n                <button [disabled]=\"!isValid()\" class=\"ok\" (click)=\"onOk()\">OK</button>\n                <button (click)=\"onDiscard()\" class=\"cancel\">Cancel</button>\n            </p>\n        </div>\n    ",
            styles: ["\n        p {\n            margin: 20px 0;\n        }\n    "]
        })
    ], InboundRuleEditComponent);
    return InboundRuleEditComponent;
}());
exports.InboundRuleEditComponent = InboundRuleEditComponent;
//# sourceMappingURL=inbound-rule-edit.js.map