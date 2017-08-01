import { Component, Input } from '@angular/core';

import { InboundRule, ActionType, RedirectType } from '../url-rewrite';

@Component({
    selector: 'inbound-rule-action',
    template: `
        <div *ngIf="rule">
            <fieldset>
                <enum [(model)]="rule.action.type" (modelChanged)="onActionType()">
                    <field name="Rewrite" value="rewrite"></field>
                    <field name="Redirect" value="redirect"></field>
                    <field name="Custom" value="custom_response"></field>
                    <field name="Abort" value="abort_request"></field>
                    <field name="None" value="none"></field>
                </enum>
            </fieldset>
            <fieldset *ngIf="rule.action.type == 'redirect'">
                <label>Response Status</label>
                <enum [(model)]="rule.action.redirect_type">
                    <field name="301" title="301 (Moved Permanently)" value="permanent"></field>
                    <field name="302" title="302 (Found)" value="found"></field>
                    <field name="303" title="303 (See Other)" value="seeother"></field>
                    <field name="307" title="307 (Temporary Redirect)" value="temporary"></field>
                </enum>
            </fieldset>
            <fieldset>
                <label>Append Query String</label>
                <switch [(model)]="rule.action.append_query_string">
                    {{rule.action.append_query_string ? "On" : "Off"}}
                </switch>
            </fieldset>
            <fieldset>
                <label>Log Rewritten Url</label>
                <switch [(model)]="rule.action.log_rewritten_url">
                    {{rule.action.log_rewritten_url ? "On" : "Off"}}
                </switch>
            </fieldset>
            <fieldset>
                <label>Stop Processing Subsequent Rules</label>
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
    }
}
