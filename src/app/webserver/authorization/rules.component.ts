import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { Selector } from '../../common/selector';
import { NotificationService } from '../../notification/notification.service';
import { AuthorizationService } from './authorization.service';
import { Authorization, AuthRule } from './authorization'

@Component({
    selector: 'auth-rules',
    template: `
<div *ngIf="_rules">

    <button class="add" [disabled]="_locked" [class.background-active]="newRule.opened" (click)="newRule.toggle()">Create Rule</button>
    <selector #newRule class="container-fluid create" (hide)="initializeNewRule()">
        <edit-rule *ngIf="newRule.opened" [rule]="_newRule" (save)="saveNew($event)" (cancel)="newRule.close()"></edit-rule>
    </selector>

    <div class="container-fluid">
        <div class="row hidden-xs hidden-sm border-active grid-list-header" [hidden]="_rules.length == 0">
            <label class="col-md-2">Access Type</label>
            <label class="col-md-4">Users</label>
            <label class="col-sm-4">Http Methods</label>
        </div>
    </div>
    <ul class="grid-list container-fluid">
        <li *ngFor="let rule of _rules; let i = index;">
            <rule [rule]="rule" (modelChanged)="saveRule(rule)" [locked]="_locked"></rule>
        </li>
    </ul>
</div>
`,
})
export class RulesComponent implements OnDestroy {
    id: string;
    private _authorization: Authorization;
    private _rules: Array<AuthRule>;
    private _newRule: AuthRule;
    private _error: any;
    private _subscriptions: Array<Subscription> = [];
    @ViewChild(Selector) private _newRuleSelector: Selector;

    constructor(private _service: AuthorizationService,
        private _notificationService: NotificationService) {
        this._subscriptions.push(this._service.rules.subscribe(rules => this._rules = rules));
        this.initializeNewRule();
    }

    public ngOnDestroy(): void {
        this._subscriptions.forEach(sub => sub.unsubscribe());
    }

    saveRule(rule: AuthRule) {
        this._service.saveRule(rule);
    }

    initializeNewRule() {
        let newRule = new AuthRule();

        newRule.users = "*";
        newRule.roles = "";
        newRule.verbs = "";
        newRule.access_type = "deny";

        this._newRule = newRule;
    }

    saveNew() {
        this._service.addRule(this._newRule)
            .then(() => this._newRuleSelector.close());
    }
}
