import { Component, OnDestroy, ViewChild } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { Selector } from '../../../common/selector';
import { UrlRewriteService } from '../url-rewrite.service';
import { InboundSection, InboundRule, PatternSyntax, ActionType, ConditionMatchConstraints, Condition, ServerVariableAssignment, MatchType } from '../url-rewrite';

@Component({
    selector: 'inbound-rules',
    template: `
        <error [error]="_service.inboundError"></error>
        <div *ngIf="!_service.inboundError">
            <override-mode class="pull-right" 
                *ngIf="_settings" 
                [metadata]="_settings.metadata"
                [scope]="_settings.scope"
                (revert)="onRevert()" 
                (modelChanged)="onModelChanged()"></override-mode>
            <div>
                <button [class.background-active]="newRule.opened" (click)="toggleNew()">Create Inbound Rule <i class="fa fa-caret-down"></i></button>
                <selector #newRule class="container-fluid">
                    <inbound-rule-edit [rule]="_newRule" (save)="saveNew($event)" (cancel)="closeNew()"></inbound-rule-edit>
                </selector>
            </div>

            <div>
                <div class="container-fluid">
                    <div class="row hidden-xs border-active grid-list-header">
                        <label class="col-sm-2">Name</label>
                        <label class="col-sm-3 col-lg-2">Url Pattern</label>
                        <label class="col-sm-3 col-lg-2">Substitution Url</label>
                        <label class="visible-lg col-lg-2">Action Type</label>
                    </div>
                </div>

                <ul class="grid-list container-fluid">
                    <li *ngFor="let rule of _rules; let i = index;">
                        <inbound-rule [rule]="rule"></inbound-rule>
                    </li>
                </ul>
            </div>
        </div>
    `
})
export class InboundRulesComponent implements OnDestroy {
    private _settings: InboundSection;
    private _newRule: InboundRule;
    private _rules: Array<InboundRule> = [];
    private _subscriptions: Array<Subscription> = [];
    @ViewChild(Selector) private _newRuleSelector: Selector;

    constructor(private _service: UrlRewriteService) {
        this._subscriptions.push(this._service.inboundSettings.subscribe(settings => this._settings = settings));
        this._subscriptions.push(this._service.inboundRules.subscribe(r => this._rules = r));
        this.initializeNewRule();
    }

    public ngOnDestroy(): void {
        this._subscriptions.forEach(sub => sub.unsubscribe());
    }

    private initializeNewRule() {
        this._newRule = new InboundRule();
        this._newRule.name = "New Rule";

        let i = 1;
        while (this._rules.find(r => r.name.toLocaleLowerCase() == this._newRule.name.toLocaleLowerCase())) {
            this._newRule.name = "New Rule " + i++;
        }

        this._newRule.pattern = "(.*)";
        this._newRule.pattern_syntax = PatternSyntax.RegularExpression;
        this._newRule.negate = false;
        this._newRule.action.type = ActionType.Rewrite;
        this._newRule.condition_match_constraints = ConditionMatchConstraints.MatchAll

        //
        // condition
        this._newRule.conditions = [];
        let condition = new Condition();
        condition.input = "{HTTPS}";
        condition.pattern = "off";
        condition.negate = false;
        condition.ignore_case = true;
        condition.match_type = MatchType.Pattern;
        this._newRule.conditions.push(condition);

        //
        // server variable
        this._newRule.server_variables = [];
        let variable = new ServerVariableAssignment();
        variable.name = "{RESPONSE_OUT_HEADER}";
        variable.value = "Some Value";
        variable.replace = true;
        this._newRule.server_variables.push(variable);

        //
        // action
        this._newRule.action.url = "{R:1}";
        this._newRule.action.append_query_string = true;
        this._newRule.action.status_code = 403;
        this._newRule.action.sub_status_code = 0;
        this._newRule.action.reason = "Forbidden: Access is denied.";
        this._newRule.action.description = "You do not have permission to view this directory or page using the credentials that you supplied";
    }

    private saveNew(condition: Condition) {
        this._service.addInboundRule(this._newRule)
            .then(() => this.closeNew());
    }

    private discardNew() {
        this._newRule = null;
    }

    private toggleNew() {
        this._newRuleSelector.toggle();
    }

    private closeNew() {
        this.initializeNewRule();
        this._newRuleSelector.close();
    }

    private onModelChanged() {
        this._service.saveInbound(this._settings);
    }

    private onRevert() {
        this._service.revert();
    }
}