import { Component, Input } from '@angular/core';

import { InboundRule, ActionType, RedirectType } from '../url-rewrite';

@Component({
    selector: 'inbound-rule-action',
    template: `
        <div *ngIf="rule">
            <fieldset>
                <enum [(model)]="rule.action.type" (modelChanged)="onActionType()">
                    <field name="Rewrite" value="rewrite" title="The request URL will be rewritten before entering the IIS pipeline"></field>
                    <field name="Redirect" value="redirect" title="A redirect response will be sent to the client"></field>
                    <field name="Custom" value="custom_response" title="Provide a custom response"></field>
                    <field name="Abort" value="abort_request" title="The request will be terminated"></field>
                    <field name="None" value="none" title="No action is taken"></field>
                </enum>
            </fieldset>
            <fieldset *ngIf="rule.action.type == 'redirect'">
                <label class="inline-block">Response Status</label>
                <tooltip>
                    Specifies the status code to use during redirect.
                    <a href="https://docs.microsoft.com/en-us/iis/extensions/url-rewrite-module/url-rewrite-module-configuration-reference" class="link"></a>
                </tooltip>
                <enum [(model)]="rule.action.redirect_type">
                    <field name="301" title="301 (Moved Permanently)" value="permanent"></field>
                    <field name="302" title="302 (Found)" value="found"></field>
                    <field name="303" title="303 (See Other)" value="seeother"></field>
                    <field name="307" title="307 (Temporary Redirect)" value="temporary"></field>
                </enum>
            </fieldset>
            <div *ngIf="rule.action.type == 'custom_response'" class="row">
                <div class="col-xs-12 col-lg-6">
                    <fieldset>
                        <label>Status Code</label>
                        <input type="text" required class="form-control" [(ngModel)]="rule.action.status_code" />
                    </fieldset>
                    <fieldset>
                        <label>Substatus Code</label>
                        <input type="text" required class="form-control" [(ngModel)]="rule.action.sub_status_code" />
                    </fieldset>
                    <fieldset>
                        <label>Reason</label>
                        <input type="text" class="form-control" [(ngModel)]="rule.action.reason" />
                    </fieldset>
                    <fieldset>
                        <label>Error Description</label>
                        <input type="text" class="form-control" [(ngModel)]="rule.action.description" />
                    </fieldset>
                </div>
            </div>
            <fieldset>
                <div>
                    <label class="inline-block">Append Query String</label>
                    <tooltip>
                        Specifies whether the query string from the current URL is preserved during substitution.
                        <a href="https://docs.microsoft.com/en-us/iis/extensions/url-rewrite-module/url-rewrite-module-configuration-reference" class="link"></a>
                    </tooltip>
                </div>
                <switch [(model)]="rule.action.append_query_string">
                    {{rule.action.append_query_string ? "On" : "Off"}}
                </switch>
            </fieldset>
            <fieldset *ngIf="rule.response_cache_directive !== undefined">
                <label class="inline-block">Response Caching</label>
                <tooltip>
                    Specifies whether the response is cachable. The default value 'auto' will allow the URL Rewrite module to decide the best behavior.
                </tooltip>
                <enum [(model)]="rule.response_cache_directive">
                    <field name="Auto" value="auto" title="Response caching is based on the Server Variables used in the rule (default)"></field>
                    <field name="Always" value="always" title="The response is always cached"></field>
                    <field name="Never" value="never" title="The response is never cached"></field>
                    <field name="Conditional" value="not_if_rule_matched" title="Caching will be disabled if the entire rule is matched with both URL and Conditions"></field>
                </enum>
            </fieldset>
            <fieldset>
                <label>Log Rewritten Url</label>
                <switch [(model)]="rule.action.log_rewritten_url">
                    {{rule.action.log_rewritten_url ? "On" : "Off"}}
                </switch>
            </fieldset>
            <fieldset>
                <div>
                    <label class="inline-block">Stop Processing Subsequent Rules</label>
                    <tooltip>
                        When this flag is turned on, it means that no more subsequent rules will be processed and the URL produced by this rule will be passed to the IIS request pipeline.
                        <a href="https://docs.microsoft.com/en-us/iis/extensions/url-rewrite-module/url-rewrite-module-configuration-reference" class="link"></a>
                    </tooltip>
                </div>
                <switch [(model)]="rule.stop_processing">
                    {{rule.stop_processing ? "On" : "Off"}}
                </switch>
            </fieldset>
        </div>
    `
})
export class InboundRuleActionComponent {
    @Input() public rule: InboundRule;

    private onActionType() {
        if (this.rule.action.type == ActionType.Redirect && !this.rule.action.redirect_type) {
            this.rule.action.redirect_type = RedirectType.Permanent;
        }
        else if (this.rule.action.type == ActionType.CustomResponse) {
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
    }
}
