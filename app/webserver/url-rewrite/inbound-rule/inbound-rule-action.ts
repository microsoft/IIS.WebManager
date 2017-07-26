import { Component, Input } from '@angular/core';

import { InboundRule } from '../url-rewrite';

@Component({
    selector: 'inbound-rule-action',
    template: `
        <div *ngIf="rule">
            <fieldset>
                <enum [(model)]="rule.action.type">
                    <field name="Rewrite" value="rewrite"></field>
                    <field name="Redirect" value="redirect"></field>
                    <field name="Custom" value="custom_response"></field>
                    <field name="Abort" value="abort_request"></field>
                    <field name="None" value="none"></field>
                </enum>
            </fieldset>
            <checkbox2 [(model)]="rule.action.append_query_string">Append Query String</checkbox2>
            <checkbox2 [(model)]="rule.action.log_rewritten_url">Log Rewritten Url</checkbox2>
            <checkbox2 [(model)]="rule.stop_processing">Stop Processing Subsequent Rules</checkbox2>
        </div>
    `,
    styles: [`
        checkbox2 {
            display: block;
        }
    `]
})
export class InboundRuleActionComponent {
    @Input() public rule: InboundRule;
}
