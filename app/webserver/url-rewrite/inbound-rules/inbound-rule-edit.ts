import { Component, Input, Output, EventEmitter } from '@angular/core';

import { UrlRewriteService } from '../url-rewrite.service';
import { InboundRule, Condition, ActionType, MatchType, ConditionMatchConstraints, ServerVariableAssignment } from '../url-rewrite';

@Component({
    selector: 'inbound-rule-edit',
    template: `
        <div>
            <tabs>
                <tab [name]="'Settings'">
                    <inbound-rule-settings [rule]="rule"></inbound-rule-settings>
                </tab>
                <tab [name]="'Action'">
                    <inbound-rule-action [rule]="rule"></inbound-rule-action>
                </tab>
                <tab [name]="'Conditions'">
                    <inbound-rule-conditions [rule]="rule"></inbound-rule-conditions>
                </tab>
                <tab [name]="'Server Variables'">
                    <inbound-rule-variables [rule]="rule"></inbound-rule-variables>
                </tab>
            </tabs>
            <p class="pull-right">
                <button [disabled]="!isValid()" class="ok" (click)="onOk()">OK</button>
                <button (click)="onDiscard()" class="cancel">Cancel</button>
            </p>
        </div>
    `,
    styles: [`
        p {
            margin: 20px 0;
        }
    `]
})
export class InboundRuleEditComponent {
    @Input() public rule: InboundRule;

    @Output() cancel: EventEmitter<any> = new EventEmitter<any>();
    @Output() save: EventEmitter<any> = new EventEmitter<any>();

    constructor(private _svc: UrlRewriteService) {
    }

    private isValid(): boolean {
        return !!this.rule.name && !!this.rule.pattern;
    }

    private onDiscard() {
        this.cancel.emit();
    }

    private onOk() {
        this.save.emit(this.rule);
    }
}