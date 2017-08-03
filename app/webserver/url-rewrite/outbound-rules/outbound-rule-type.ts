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
                <label>Look For Match In</label>
                <enum [(model)]="rule.match_type" (modelChanged)="onMatchType()">
                    <field name="Response Tags" value="tags"></field>
                    <field name="Server Variable" value="server_variable"></field>
                </enum>
            </fieldset>

            <fieldset class="flags" *ngIf="rule.match_type == 'tags'">
                <div class="inline-block">
                    <checkbox2 [(model)]="rule.tags.a">a</checkbox2>
                    <checkbox2 [(model)]="rule.tags.area">area</checkbox2>
                    <checkbox2 [(model)]="rule.tags.base">base</checkbox2>
                    <checkbox2 [(model)]="rule.tags.form">form</checkbox2>
                    <checkbox2 [(model)]="rule.tags.frame">frame</checkbox2>
                    <checkbox2 [(model)]="rule.tags.head">head</checkbox2>
                </div>
                <div class="inline-block">
                    <checkbox2 [(model)]="rule.tags.iframe">iframe</checkbox2>
                    <checkbox2 [(model)]="rule.tags.img">img</checkbox2>
                    <checkbox2 [(model)]="rule.tags.input">input</checkbox2>
                    <checkbox2 [(model)]="rule.tags.link">link</checkbox2>
                    <checkbox2 [(model)]="rule.tags.script">script</checkbox2>
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
        if (this.rule.match_type == OutboundMatchType.Tags && !this.rule.tags) {
            this.rule.tags = new OutboundTags();
        }
    }
}
