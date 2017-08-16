import { Component, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { DiffUtil } from '../../utils/diff';
import { NotificationService } from '../../notification/notification.service';
import { AuthorizationService } from './authorization.service';
import { RuleComponent } from './rule.component';
import { Authorization, AuthRule } from './authorization'

@Component({
    selector: 'auth-rules',
    template: `
        <div *ngIf="_rules">
            <button class="create" (click)="createRule()" [disabled]="_locked"><i class="fa fa-plus blue"></i><span>Add</span></button>
            <div class="container-fluid">
                <div class="row hidden-xs hidden-sm border-active grid-list-header" [hidden]="_rules.length == 0">
                    <label class="col-md-2">Access Type</label>
                    <label class="col-md-4">Users</label>
                    <label class="col-sm-4">Http Methods</label>
                </div>
            </div>
            <ul class="grid-list container-fluid">
                <li *ngIf="_newRule">
                    <rule [rule]="_newRule" (modelChanged)="saveNew()" (discard)="_newRule=null"></rule>
                </li>
                <li *ngFor="let rule of _rules; let i = index;">
                    <rule [rule]="rule" (modelChanged)="saveRule(rule)" [locked]="_locked"></rule>
                </li>
            </ul>
        </div>
    `
})
export class RulesComponent implements OnDestroy {
    id: string;
    private _authorization: Authorization;
    private _rules: Array<AuthRule>;
    private _newRule: AuthRule;
    private _error: any;
    private _subscriptions: Array<Subscription> = [];

    constructor(private _service: AuthorizationService,
        private _notificationService: NotificationService) {
        this._subscriptions.push(this._service.rules.subscribe(rules => this._rules = rules));
    }

    public ngOnDestroy(): void {
        this._subscriptions.forEach(sub => sub.unsubscribe());
    }

    saveRule(rule: AuthRule) {
        this._service.saveRule(rule);
    }

    createRule() {
        if (this._newRule) {
            return;
        }

        let newRule = new AuthRule();

        newRule.users = "";
        newRule.roles = "";
        newRule.verbs = "";
        newRule.access_type = "deny";

        this._newRule = newRule;
    }

    saveNew() {
        this._service.addRule(this._newRule);
        this._newRule = null;
    }
}
