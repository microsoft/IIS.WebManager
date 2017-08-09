import { Component, OnDestroy, ViewChild } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { Selector } from '../../../common/selector';
import { UrlRewriteService } from '../service/url-rewrite.service';
import { OutboundSection, OutboundRule, PatternSyntax, OutboundTags, ActionType, ConditionMatchConstraints, Condition, MatchType, OutboundMatchType } from '../url-rewrite';

@Component({
    selector: 'outbound-rules',
    template: `
        <error [error]="_service.outboundError"></error>
        <div *ngIf="!_service.outboundError && _settings">
            <override-mode class="pull-right"
                [metadata]="_settings.metadata"
                [scope]="_settings.scope"
                (revert)="onRevert()" 
                (modelChanged)="onModelChanged()"></override-mode>
            <div>
                <fieldset>
                    <label>Rewrite Before Caching</label>
                    <switch *ngIf="_settings.rewrite_before_cache !== undefined" [(model)]="_settings.rewrite_before_cache" (modelChanged)="onModelChanged()">{{_settings.rewrite_before_cache ? "On" : "Off"}}</switch>
                </fieldset>
                
                <button class="create" [class.background-active]="newRule.opened" (click)="toggleNew()">Create Rule <i class="fa fa-caret-down"></i></button>
                <selector #newRule class="container-fluid create">
                    <outbound-rule-edit [rule]="_newRule" (save)="saveNew()" (cancel)="closeNew()"></outbound-rule-edit>
                </selector>
            </div>

            <div>
                <div class="container-fluid">
                    <div class="row hidden-xs border-active grid-list-header">
                        <label class="col-sm-3">Name</label>
                        <label class="visible-lg col-lg-2">Action Type</label>
                        <label class="col-sm-3 col-lg-2">Pattern</label>
                        <label class="col-sm-4">Substitution Value</label>
                    </div>
                </div>

                <ul class="grid-list container-fluid">
                    <li *ngFor="let rule of _rules">
                        <outbound-rule [rule]="rule"></outbound-rule>
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
export class OutboundRulesComponent implements OnDestroy {
    private _settings: OutboundSection;
    private _newRule: OutboundRule;
    private _rules: Array<OutboundRule> = [];
    private _subscriptions: Array<Subscription> = [];
    @ViewChild(Selector) private _newRuleSelector: Selector;

    constructor(private _service: UrlRewriteService) {
        this._subscriptions.push(this._service.outboundSettings.subscribe(settings => this._settings = settings));
        this._subscriptions.push(this._service.outboundRules.subscribe(r => {
            this._rules = r;
            this.initializeNewRule();
        }));
        this.initializeNewRule();
    }

    public ngOnDestroy(): void {
        this._subscriptions.forEach(sub => sub.unsubscribe());
    }

    private initializeNewRule() {
        this._newRule = new OutboundRule();
        this._newRule.name = "New Rule";

        let i = 1;
        while (this._rules.find(r => r.name.toLocaleLowerCase() == this._newRule.name.toLocaleLowerCase())) {
            this._newRule.name = "New Rule " + i++;
        }

        this._newRule.pattern = "(.*)";
        this._newRule.pattern_syntax = PatternSyntax.RegularExpression;
        this._newRule.enabled = true;
        this._newRule.ignore_case = true;
        this._newRule.negate = false;
        this._newRule.condition_match_constraints = ConditionMatchConstraints.MatchAll

        //
        // condition
        this._newRule.conditions = [];

        //
        // action
        this._newRule.rewrite_value = "{R:1}";
        this._newRule.match_type = OutboundMatchType.Response;
        this._newRule.server_variable = "";
        this._newRule.tag_filters = new OutboundTags();
    }

    private saveNew() {
        this._service.addOutboundRule(this._newRule)
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
        this._service.saveOutbound(this._settings);
    }

    private onRevert() {
        this._service.revertOutbound();
    }
}