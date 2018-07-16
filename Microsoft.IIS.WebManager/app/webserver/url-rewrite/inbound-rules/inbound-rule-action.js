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
var InboundRuleActionComponent = /** @class */ (function () {
    function InboundRuleActionComponent() {
    }
    InboundRuleActionComponent.prototype.onActionType = function () {
        if (this.rule.action.type == url_rewrite_1.ActionType.Redirect && !this.rule.action.redirect_type) {
            this.rule.action.redirect_type = url_rewrite_1.RedirectType.Permanent;
        }
        else if (this.rule.action.type == url_rewrite_1.ActionType.CustomResponse) {
            //
            // Setup custom response action type
            if (!this.rule.action.status_code) {
                this.rule.action.status_code = 403;
            }
            if (!this.rule.action.sub_status_code) {
                this.rule.action.sub_status_code = 0;
            }
            if (!this.rule.action.reason) {
                this.rule.action.reason = "Forbidden: Access is denied.";
            }
            if (!this.rule.action.description) {
                this.rule.action.description = "You do not have permission to view this directory or page using the credentials that you supplied";
            }
        }
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", url_rewrite_1.InboundRule)
    ], InboundRuleActionComponent.prototype, "rule", void 0);
    InboundRuleActionComponent = __decorate([
        core_1.Component({
            selector: 'inbound-rule-action',
            template: "\n        <div *ngIf=\"rule\">\n            <fieldset>\n                <enum [(model)]=\"rule.action.type\" (modelChanged)=\"onActionType()\">\n                    <field name=\"Rewrite\" value=\"rewrite\" title=\"The request URL will be rewritten before entering the IIS pipeline\"></field>\n                    <field name=\"Redirect\" value=\"redirect\" title=\"A redirect response will be sent to the client\"></field>\n                    <field name=\"Custom\" value=\"custom_response\" title=\"Provide a custom response\"></field>\n                    <field name=\"Abort\" value=\"abort_request\" title=\"The request will be terminated\"></field>\n                    <field name=\"None\" value=\"none\" title=\"No action is taken\"></field>\n                </enum>\n            </fieldset>\n            <fieldset *ngIf=\"rule.action.type == 'redirect'\">\n                <label class=\"inline-block\">Response Status</label>\n                <tooltip>\n                    Specifies the status code to use during redirect.\n                    <a href=\"https://docs.microsoft.com/en-us/iis/extensions/url-rewrite-module/url-rewrite-module-configuration-reference\" class=\"link\"></a>\n                </tooltip>\n                <enum [(model)]=\"rule.action.redirect_type\">\n                    <field name=\"301\" title=\"301 (Moved Permanently)\" value=\"permanent\"></field>\n                    <field name=\"302\" title=\"302 (Found)\" value=\"found\"></field>\n                    <field name=\"303\" title=\"303 (See Other)\" value=\"seeother\"></field>\n                    <field name=\"307\" title=\"307 (Temporary Redirect)\" value=\"temporary\"></field>\n                </enum>\n            </fieldset>\n            <div *ngIf=\"rule.action.type == 'custom_response'\" class=\"row\">\n                <div class=\"col-xs-12 col-lg-6\">\n                    <fieldset>\n                        <label>Status Code</label>\n                        <input type=\"text\" required class=\"form-control\" [(ngModel)]=\"rule.action.status_code\" />\n                    </fieldset>\n                    <fieldset>\n                        <label>Substatus Code</label>\n                        <input type=\"text\" required class=\"form-control\" [(ngModel)]=\"rule.action.sub_status_code\" />\n                    </fieldset>\n                    <fieldset>\n                        <label>Reason</label>\n                        <input type=\"text\" class=\"form-control\" [(ngModel)]=\"rule.action.reason\" />\n                    </fieldset>\n                    <fieldset>\n                        <label>Error Description</label>\n                        <input type=\"text\" class=\"form-control\" [(ngModel)]=\"rule.action.description\" />\n                    </fieldset>\n                </div>\n            </div>\n            <fieldset>\n                <div>\n                    <label class=\"inline-block\">Append Query String</label>\n                    <tooltip>\n                        Specifies whether the query string from the current URL is preserved during substitution.\n                        <a href=\"https://docs.microsoft.com/en-us/iis/extensions/url-rewrite-module/url-rewrite-module-configuration-reference\" class=\"link\"></a>\n                    </tooltip>\n                </div>\n                <switch [(model)]=\"rule.action.append_query_string\">\n                    {{rule.action.append_query_string ? \"On\" : \"Off\"}}\n                </switch>\n            </fieldset>\n            <fieldset *ngIf=\"rule.response_cache_directive\">\n                <label class=\"inline-block\">Response Caching</label>\n                <tooltip>\n                    Specifies whether the response is cachable. The default value 'auto' will allow the URL Rewrite module to decide the best behavior.\n                </tooltip>\n                <enum [(model)]=\"rule.response_cache_directive\">\n                    <field name=\"Auto\" value=\"auto\" title=\"Response caching is based on the Server Variables used in the rule (default)\"></field>\n                    <field name=\"Always\" value=\"always\" title=\"The response is always cached\"></field>\n                    <field name=\"Never\" value=\"never\" title=\"The response is never cached\"></field>\n                    <field name=\"Conditional\" value=\"not_if_rule_matched\" title=\"Caching will be disabled if the entire rule is matched with both URL and Conditions\"></field>\n                </enum>\n            </fieldset>\n            <fieldset>\n                <label>Log Rewritten Url</label>\n                <switch [(model)]=\"rule.action.log_rewritten_url\">\n                    {{rule.action.log_rewritten_url ? \"On\" : \"Off\"}}\n                </switch>\n            </fieldset>\n            <fieldset>\n                <div>\n                    <label class=\"inline-block\">Stop Processing Subsequent Rules</label>\n                    <tooltip>\n                        When this flag is turned on, it means that no more subsequent rules will be processed and the URL produced by this rule will be passed to the IIS request pipeline.\n                        <a href=\"https://docs.microsoft.com/en-us/iis/extensions/url-rewrite-module/url-rewrite-module-configuration-reference\" class=\"link\"></a>\n                    </tooltip>\n                </div>\n                <switch [(model)]=\"rule.stop_processing\">\n                    {{rule.stop_processing ? \"On\" : \"Off\"}}\n                </switch>\n            </fieldset>\n        </div>\n    "
        })
    ], InboundRuleActionComponent);
    return InboundRuleActionComponent;
}());
exports.InboundRuleActionComponent = InboundRuleActionComponent;
//# sourceMappingURL=inbound-rule-action.js.map