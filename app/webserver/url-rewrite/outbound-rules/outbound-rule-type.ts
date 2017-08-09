import { Component, Inject, Input } from '@angular/core';

import { OutboundRule, OutboundMatchType, OutboundTags, IIS_SERVER_VARIABLES } from '../url-rewrite';

@Component({
    selector: 'outbound-rule-type',
    template: `
        <div *ngIf="rule">
            <fieldset>
                <label>Active</label>
                <switch [(model)]="rule.enabled">{{rule.enabled ? "Yes": "No"}}</switch>
            </fieldset>

            <fieldset>
                <label>Match</label>
                <enum [(model)]="rule.match_type" (modelChanged)="onMatchType()">
                    <field name="Response" value="response"></field>
                    <field name="Server Variable" value="server_variable"></field>
                </enum>
            </fieldset>

            <fieldset class="flags" *ngIf="rule.match_type == 'response'">
                <label>Filter By</label>
                <div class="inline-block">
                    <checkbox2 [(model)]="rule.tag_filters.a">a</checkbox2>
                    <checkbox2 [(model)]="rule.tag_filters.area">area</checkbox2>
                    <checkbox2 [(model)]="rule.tag_filters.base">base</checkbox2>
                    <checkbox2 [(model)]="rule.tag_filters.form">form</checkbox2>
                    <checkbox2 [(model)]="rule.tag_filters.frame">frame</checkbox2>
                    <checkbox2 [(model)]="rule.tag_filters.head">head</checkbox2>
                </div>
                <div class="inline-block">
                    <checkbox2 [(model)]="rule.tag_filters.iframe">iframe</checkbox2>
                    <checkbox2 [(model)]="rule.tag_filters.img">img</checkbox2>
                    <checkbox2 [(model)]="rule.tag_filters.input">input</checkbox2>
                    <checkbox2 [(model)]="rule.tag_filters.link">link</checkbox2>
                    <checkbox2 [(model)]="rule.tag_filters.script">script</checkbox2>
                </div>
            </fieldset>

            <fieldset *ngIf="rule.match_type == 'server_variable'">
                <label>Server Variable</label>
                <input type="text" required class="form-control name" list="server-vars" [(ngModel)]="rule.server_variable" />
                <datalist id="server-vars">
                    <option *ngFor="let variable of _serverVariables" value="{{variable}}">
                </datalist>
            </fieldset>
        </div>
    `,
    styles: [`
        .inline-block {
            margin-right: 140px;
            vertical-align: top;
        }
    `]
})
export class OutboundRuleTypeComponent {
    @Input() public rule: OutboundRule;

    private _serverVariables: Array<string> = IIS_SERVER_VARIABLES;

    private onMatchType() {
        if (this.rule.match_type == OutboundMatchType.Response && !this.rule.tag_filters) {
            this.rule.tag_filters = new OutboundTags();
        }
    }
}
