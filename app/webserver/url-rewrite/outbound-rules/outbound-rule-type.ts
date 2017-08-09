import { Component, Inject, Input } from '@angular/core';

import { OutboundRule, OutboundMatchType, OutboundTags, IIS_SERVER_VARIABLES } from '../url-rewrite';

@Component({
    selector: 'outbound-rule-type',
    template: `
        <div *ngIf="rule">
            <fieldset>
                <div>
                    <label class="inline-block">Active</label>
                    <tooltip>
                        An inactive outbound rule will not perform any rewriting of the response.
                    </tooltip>
                </div>
                <switch [(model)]="rule.enabled">{{rule.enabled ? "Yes": "No"}}</switch>
            </fieldset>

            <fieldset>
                <label class="inline-block">Match</label>
                <tooltip>
                    An outbound rule can operate on the response body content or the content of an HTTP header (via server variable).
                    <a class="link" href="https://docs.microsoft.com/en-us/iis/extensions/url-rewrite-module/creating-outbound-rules-for-url-rewrite-module#create-an-outbound-rewrite-rule"></a>
                </tooltip>
                <enum [(model)]="rule.match_type" (modelChanged)="onMatchType()">
                    <field name="Response" value="response"></field>
                    <field name="Server Variable" value="server_variable"></field>
                </enum>
            </fieldset>

            <fieldset class="flags" *ngIf="rule.match_type == 'response'">
                <div>
                    <label class="inline-block">Filter By</label>
                    <tooltip>
                        Tag filters are used to scope the pattern matching to a certain HTML elements only, instead of evaluating the entire response against the rule's pattern.
                        <a class="link" href="https://docs.microsoft.com/en-us/iis/extensions/url-rewrite-module/creating-outbound-rules-for-url-rewrite-module#create-an-outbound-rewrite-rule"></a>
                    </tooltip>
                </div>
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
                <label class="inline-block">Server Variable</label>
                <tooltip>
                    Server variables can be used to rewrite HTTP headers.
                    <a class="link" href="https://docs.microsoft.com/en-us/iis/extensions/url-rewrite-module/modifying-http-response-headers#creating-an-outbound-rule-to-modify-the-http-response-header"></a>
                </tooltip>
                <input type="text" required class="form-control name" list="server-vars" [(ngModel)]="rule.server_variable" />
                <datalist id="server-vars">
                    <option *ngFor="let variable of _serverVariables" value="{{variable}}">
                </datalist>
            </fieldset>
        </div>
    `,
    styles: [`
        div.inline-block {
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
