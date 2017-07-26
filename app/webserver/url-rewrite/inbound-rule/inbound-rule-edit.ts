import { Component } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { InboundRule, Condition, ActionType, MatchType, ConditionMatchConstraints, ServerVariableAssignment } from '../url-rewrite';

@Component({
    selector: 'inbound-rule-edit',
    template: `
        <div>
            <h2>Create Rule</h2>
            <tabs>
                <tab [name]="'Settings'">
                    <inbound-rule-settings [rule]="_rule"></inbound-rule-settings>
                </tab>
                <tab [name]="'Action'">
                    <inbound-rule-action [rule]="_rule"></inbound-rule-action>
                </tab>
                <tab [name]="'Conditions'">
                    <inbound-rule-conditions [rule]="_rule"></inbound-rule-conditions>
                </tab>
                <tab [name]="'Server Variables'">
                    <inbound-rule-variables [rule]="_rule"></inbound-rule-variables>
                </tab>
            </tabs>
        </div>
    `
})
export class InboundRuleEditComponent {
    private _rule: InboundRule;

    constructor() {
        this._rule = new InboundRule();
        this._rule.action.type = ActionType.Rewrite;
        this._rule.condition_match_constraints = ConditionMatchConstraints.MatchAll

        //
        // condition
        this._rule.conditions = [];
        let condition = new Condition();
        condition.input = "{HTTPS}";
        condition.pattern = "off";
        condition.negate = false;
        condition.ignore_case = true;
        condition.match_type = MatchType.Pattern;
        this._rule.conditions.push(condition);

        //
        // server variable
        this._rule.server_variables = [];
        let variable = new ServerVariableAssignment();
        variable.name = "{RESPONSE_OUT_HEADER}";
        variable.value = "Some Value";
        variable.replace = true;
        this._rule.server_variables.push(variable);
    }
}

