import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { Selector } from '../../../common/selector';
import { UrlRewriteService } from '../service/url-rewrite.service';
import { InboundSection, InboundRule, PatternSyntax, ActionType, ConditionMatchConstraints, Condition, ServerVariableAssignment, MatchType, ResponseCacheDirective } from '../url-rewrite';

@Component({
    selector: 'inbound-rules',
    template: `
        <error [error]="service.inboundError"></error>
        <div *ngIf="!service.inboundError && _settings != null">
            <override-mode class="pull-right"
                [metadata]="_settings.metadata"
                [scope]="_settings.scope"
                (revert)="onRevert()" 
                (modelChanged)="onModelChanged()"></override-mode>
            <div>
                <fieldset>
                    <switch label="Original Url Encoding" *ngIf="_settings.use_original_url_encoding !== undefined" [(model)]="_settings.use_original_url_encoding" (modelChanged)="onModelChanged()">{{_settings.use_original_url_encoding ? "Yes" : "No"}}</switch>
                </fieldset>
                
                <button class="create" [class.background-active]="newRule.opened" (click)="newRule.toggle()">Create Rule <i class="fa fa-caret-down"></i></button>
                <selector #newRule class="container-fluid create" (hide)="initializeNewRule()">
                    <inbound-rule-edit *ngIf="newRule.opened" [rule]="_newRule" (save)="saveNew($event)" (cancel)="newRule.close()"></inbound-rule-edit>
                </selector>
            </div>

            <div>
                <div class="container-fluid">
                    <div class="row hidden-xs border-active grid-list-header">
                        <label class="col-sm-3">Name</label>
                        <label class="visible-lg col-lg-2">Action Type</label>
                        <label class="col-sm-3 col-lg-2">Url Pattern</label>
                        <label class="col-sm-4">Substitution Url</label>
                    </div>
                </div>

                <ul class="grid-list container-fluid">
                    <li *ngFor="let rule of _rules; let i = index;">
                        <inbound-rule [rule]="rule"></inbound-rule>
                    </li>
                </ul>
            </div>
        </div>
    `,
    styles: [`
        button.create {
            margin: 30px 0 0 0;
        }
    `]
})
export class InboundRulesComponent implements OnDestroy {
    private _settings: InboundSection;
    private _newRule: InboundRule;
    private _rules: Array<InboundRule> = [];
    private _subscriptions: Array<Subscription> = [];
    @ViewChild(Selector) private _newRuleSelector: Selector;

    constructor(private _service: UrlRewriteService) {
        this._subscriptions.push(this._service.inboundSettings.subscribe(settings => this._settings = settings));
        this._subscriptions.push(this._service.inboundRules.subscribe(r => {
            this._rules = r;
            this.initializeNewRule();
        }));
        this.initializeNewRule();
    }

    public ngOnDestroy(): void {
        this._subscriptions.forEach(sub => sub.unsubscribe());
    }

    get service() {
        return this._service;
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
        this._newRule.ignore_case = true;
        this._newRule.negate = false;
        this._newRule.action.type = ActionType.Rewrite;
        this._newRule.condition_match_constraints = ConditionMatchConstraints.MatchAll

        //
        // condition
        this._newRule.conditions = [];

        //
        // server variable
        this._newRule.server_variables = [];

        //
        // action
        this._newRule.action.url = "{R:1}";
        this._newRule.action.append_query_string = true;
        this._newRule.action.status_code = 403;
        this._newRule.action.sub_status_code = 0;
        this._newRule.action.reason = "Forbidden: Access is denied.";
        this._newRule.action.description = "You do not have permission to view this directory or page using the credentials that you supplied";
        this._newRule.response_cache_directive = undefined;

        //
        // Both properties added in Url Rewrite 2.1
        if (this._settings && this._settings.use_original_url_encoding !== undefined) {
            this._newRule.response_cache_directive = ResponseCacheDirective.Auto;
        }
    }

    private saveNew(condition: Condition) {
        this._service.addInboundRule(this._newRule)
            .then(() => this._newRuleSelector.close());
    }

    private onModelChanged() {
        this._service.saveInbound(this._settings);
    }

    private onRevert() {
        this._service.revertInbound();
    }
}