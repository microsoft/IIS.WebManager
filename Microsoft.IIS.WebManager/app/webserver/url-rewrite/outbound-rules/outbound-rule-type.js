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
var OutboundRuleTypeComponent = /** @class */ (function () {
    function OutboundRuleTypeComponent() {
        this._serverVariables = url_rewrite_1.IIS_SERVER_VARIABLES;
    }
    OutboundRuleTypeComponent.prototype.onMatchType = function () {
        if (this.rule.match_type == url_rewrite_1.OutboundMatchType.Response && !this.rule.tag_filters) {
            this.rule.tag_filters = new url_rewrite_1.OutboundTags();
        }
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", url_rewrite_1.OutboundRule)
    ], OutboundRuleTypeComponent.prototype, "rule", void 0);
    OutboundRuleTypeComponent = __decorate([
        core_1.Component({
            selector: 'outbound-rule-type',
            template: "\n        <div *ngIf=\"rule\">\n            <fieldset>\n                <div>\n                    <label class=\"inline-block\">Active</label>\n                    <tooltip>\n                        An inactive outbound rule will not perform any rewriting of the response.\n                    </tooltip>\n                </div>\n                <switch [(model)]=\"rule.enabled\">{{rule.enabled ? \"Yes\": \"No\"}}</switch>\n            </fieldset>\n\n            <fieldset>\n                <label class=\"inline-block\">Match</label>\n                <tooltip>\n                    An outbound rule can operate on the response body content or the content of an HTTP header (via server variable).\n                    <a class=\"link\" href=\"https://docs.microsoft.com/en-us/iis/extensions/url-rewrite-module/creating-outbound-rules-for-url-rewrite-module#create-an-outbound-rewrite-rule\"></a>\n                </tooltip>\n                <enum [(model)]=\"rule.match_type\" (modelChanged)=\"onMatchType()\">\n                    <field name=\"Response\" value=\"response\"></field>\n                    <field name=\"Server Variable\" value=\"server_variable\"></field>\n                </enum>\n            </fieldset>\n\n            <fieldset class=\"flags\" *ngIf=\"rule.match_type == 'response'\">\n                <div>\n                    <label class=\"inline-block\">Filter By</label>\n                    <tooltip>\n                        Tag filters are used to scope the pattern matching to a certain HTML elements only, instead of evaluating the entire response against the rule's pattern.\n                        <a class=\"link\" href=\"https://docs.microsoft.com/en-us/iis/extensions/url-rewrite-module/creating-outbound-rules-for-url-rewrite-module#create-an-outbound-rewrite-rule\"></a>\n                    </tooltip>\n                </div>\n                <div class=\"inline-block\">\n                    <checkbox2 [(model)]=\"rule.tag_filters.a\">a</checkbox2>\n                    <checkbox2 [(model)]=\"rule.tag_filters.area\">area</checkbox2>\n                    <checkbox2 [(model)]=\"rule.tag_filters.base\">base</checkbox2>\n                    <checkbox2 [(model)]=\"rule.tag_filters.form\">form</checkbox2>\n                    <checkbox2 [(model)]=\"rule.tag_filters.frame\">frame</checkbox2>\n                    <checkbox2 [(model)]=\"rule.tag_filters.head\">head</checkbox2>\n                </div>\n                <div class=\"inline-block\">\n                    <checkbox2 [(model)]=\"rule.tag_filters.iframe\">iframe</checkbox2>\n                    <checkbox2 [(model)]=\"rule.tag_filters.img\">img</checkbox2>\n                    <checkbox2 [(model)]=\"rule.tag_filters.input\">input</checkbox2>\n                    <checkbox2 [(model)]=\"rule.tag_filters.link\">link</checkbox2>\n                    <checkbox2 [(model)]=\"rule.tag_filters.script\">script</checkbox2>\n                </div>\n            </fieldset>\n\n            <fieldset *ngIf=\"rule.match_type == 'server_variable'\">\n                <label class=\"inline-block\">Server Variable</label>\n                <tooltip>\n                    Server variables can be used to rewrite HTTP headers.\n                    <a class=\"link\" href=\"https://docs.microsoft.com/en-us/iis/extensions/url-rewrite-module/modifying-http-response-headers#creating-an-outbound-rule-to-modify-the-http-response-header\"></a>\n                </tooltip>\n                <input type=\"text\" required class=\"form-control name\" list=\"server-vars\" [(ngModel)]=\"rule.server_variable\" />\n                <datalist id=\"server-vars\">\n                    <option *ngFor=\"let variable of _serverVariables\" value=\"{{variable}}\">\n                </datalist>\n            </fieldset>\n        </div>\n    ",
            styles: ["\n        div.inline-block {\n            margin-right: 140px;\n            vertical-align: top;\n        }\n    "]
        })
    ], OutboundRuleTypeComponent);
    return OutboundRuleTypeComponent;
}());
exports.OutboundRuleTypeComponent = OutboundRuleTypeComponent;
//# sourceMappingURL=outbound-rule-type.js.map