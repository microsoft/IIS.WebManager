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
var url_rewrite_service_1 = require("../service/url-rewrite.service");
var url_rewrite_1 = require("../url-rewrite");
var OutboundRuleEditComponent = /** @class */ (function () {
    function OutboundRuleEditComponent(_svc) {
        this._svc = _svc;
        this.cancel = new core_1.EventEmitter();
        this.save = new core_1.EventEmitter();
    }
    OutboundRuleEditComponent.prototype.isValid = function () {
        return !!this.rule.name &&
            !!this.rule.pattern &&
            (this.rule.match_type != url_rewrite_1.OutboundMatchType.ServerVariable || !!this.rule.server_variable);
    };
    OutboundRuleEditComponent.prototype.onDiscard = function () {
        this.cancel.emit();
    };
    OutboundRuleEditComponent.prototype.onOk = function () {
        this.save.emit(this.rule);
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", url_rewrite_1.OutboundRule)
    ], OutboundRuleEditComponent.prototype, "rule", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], OutboundRuleEditComponent.prototype, "cancel", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], OutboundRuleEditComponent.prototype, "save", void 0);
    OutboundRuleEditComponent = __decorate([
        core_1.Component({
            selector: 'outbound-rule-edit',
            template: "\n        <div>\n            <tabs>\n                <tab [name]=\"'Settings'\">\n                    <outbound-rule-settings [rule]=\"rule\"></outbound-rule-settings>\n                </tab>\n                <tab [name]=\"'Rewrite'\">\n                    <outbound-rule-type [rule]=\"rule\"></outbound-rule-type>\n                </tab>\n                <tab [name]=\"'Conditions'\">\n                    <inbound-rule-conditions [rule]=\"rule\"></inbound-rule-conditions>\n                </tab>\n            </tabs>\n            <p class=\"pull-right\">\n                <button [disabled]=\"!isValid()\" class=\"ok\" (click)=\"onOk()\">OK</button>\n                <button (click)=\"onDiscard()\" class=\"cancel\">Cancel</button>\n            </p>\n        </div>\n    ",
            styles: ["\n        p {\n            margin: 20px 0;\n        }\n    "]
        }),
        __metadata("design:paramtypes", [url_rewrite_service_1.UrlRewriteService])
    ], OutboundRuleEditComponent);
    return OutboundRuleEditComponent;
}());
exports.OutboundRuleEditComponent = OutboundRuleEditComponent;
//# sourceMappingURL=outbound-rule-edit.js.map