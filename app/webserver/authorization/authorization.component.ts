import {Component, QueryList, ViewChildren, OnInit} from '@angular/core';

import {AuthorizationService} from './authorization.service';
import {Logger} from '../../common/logger';
import {NotificationService} from '../../notification/notification.service';
import {RuleComponent} from './rule.component';

import {Authorization, AuthRule} from './authorization'
import {DiffUtil} from '../../utils/diff';


@Component({
    template: `
        <loading *ngIf="!(authorization || _error)"></loading>
        <error [error]="_error" [notInstalled]="true"></error>
        <div *ngIf="authorization">
            <override-mode class="pull-right" [scope]="authorization.scope" (revert)="onRevert()" [metadata]="authorization.metadata" (modelChanged)="onModelChanged()"></override-mode>                
            <button class="create" (click)="createRule()" [disabled]="_locked" [class.inactive]="_editing != -1"><i class="fa fa-plus blue"></i><span>Add</span></button>
            <div class="container-fluid">
                <div class="row hidden-xs hidden-sm border-active grid-list-header" [hidden]="rules.length == 0">
                    <label class="col-md-2">Access Type</label>
                    <label class="col-md-4">Users</label>
                    <label class="col-sm-4">Http Methods</label>
                </div>
            </div>
            <ul class="grid-list container-fluid">
                <li *ngFor="let rule of rules; let i = index;">
                    <rule [rule]="rule" (delete)="deleteRule(i)" (add)="addRule(i)" (modelChanged)="saveRule(i)" (edit)="editRule(i)" (discard)="discard()" [locked]="_locked"></rule>
                </li>
            </ul>
        </div>
    `
})
export class AuthorizationComponent implements OnInit {

    id: string;
    authorization: Authorization;
    rules: Array<AuthRule>;

    private _locked: boolean;
    private _original: Authorization;
    private _originalRules: Array<AuthRule>;
    private _error: any;
    private _editing: number;

    @ViewChildren(RuleComponent)
    ruleComponents: QueryList<RuleComponent>;

    constructor(private _service: AuthorizationService,
        private _logger: Logger,
        private _notificationService: NotificationService) {
    }

    ngOnInit() {
        this.initialize();
    }

    onModelChanged() {

        if (this.authorization) {

            var changes = DiffUtil.diff(this._original, this.authorization);

            if (Object.keys(changes).length > 0) {

                this._service.updateFeature(this.authorization, changes)
                    .then(feature => {
                        this._notificationService.clearWarnings();

                        this.setFeature(feature);
                    });
            }
            else {
                this._notificationService.clearWarnings();
            }
        }

    }

    onRevert() {
        this._service.revertFeature(this.authorization)
            .then(_ => {
                this.initialize();
            })
            .catch(e => {
                this._error = e;
            });
    }

    saveRule(index) {

        if (this.rules && this.rules[index] && this.rules[index].id != "") {

            var ruleChanges = DiffUtil.diff(this._originalRules[index], this.rules[index]);

            if (Object.keys(ruleChanges).length > 0) {

                this._service.updateRule(this.rules[index], ruleChanges)
                    .then(rule => {
                        this.setRule(index, rule);
                    });

            }
            else {
                this._notificationService.clearWarnings();
            }

            this._editing = -1;
            this.enableEditing();
        }
    }

    editRule(index) {
        if (this.discard()) {
            this._editing = index;
        }
        else {
            this._editing = index - 1;
        }
        this.disableEditingExcept(this._editing);
    }

    discard(): boolean {
        if (this._editing != -1) {
            if (this.rules[this._editing].id) {
                this.setRule(this._editing, this._originalRules[this._editing]);
                this._editing = -1;
                this.enableEditing();
                return true;
            }
            else {
                this.deleteRule(this._editing);
                return false;
            }
        }
        return true;
    }

    deleteRule(index) {
        if (this.rules && this.rules[index]) {
            if ("id" in this.rules[index] && this.rules[index].id != "")
                this._service.removeRule(this.rules[index]);

            this.rules.splice(index, 1);
            this._originalRules.splice(index, 1);

            if (this._editing == index) {
                this._editing = -1;
                this.enableEditing();
            }
            else if (this._editing > index) {
                this._editing -= 1;
                this.disableEditingExcept(this._editing);
            }
        }
    }

    createRule() {

        if (this.rules.length > 0 && !("id" in this.rules[0]))
            return;

        this.discard();

        var newRule = new AuthRule();

        newRule.users = "";
        newRule.roles = "";
        newRule.verbs = "";
        newRule.access_type = "deny";

        this.rules.unshift(newRule);
        this._originalRules.unshift(newRule);
        this._editing = 0;
        this.disableEditingExcept(-1); // New rule is not yet added to ruleComponents, therefore disable editing for all
    }

    addRule(index) {
        this._service.addRule(this.authorization, this.rules[index])
            .then(rule => {
                this.setRule(index, rule);
            })
            .catch(e => {
                this.initialize();
            });
        this._editing = -1;
        this.enableEditing();
    }

    private initialize() {
        this._editing = -1;
        this._service.get(this.id)
            .then(settings => {
                this.setFeature(settings.feature);
                this.rules = settings.rules;
                this._originalRules = JSON.parse(JSON.stringify(settings.rules));
            })
            .catch(e => {
                this._error = e;
            });
    }

    private setFeature(feature) {
        this.authorization = feature;
        this._original = JSON.parse(JSON.stringify(feature));

        this._locked = this.authorization.metadata.is_locked ? true : null;
    }

    private setRule(index, rule) {
        this.rules[index] = rule;
        this._originalRules[index] = JSON.parse(JSON.stringify(rule));
    }

    private disableEditingExcept(index) {
        let arr = this.ruleComponents.toArray();
        for (var i = 0; i < arr.length; i++) {
            if (i !== index) {
                if (arr[i].rule.id) {
                    arr[i].setEditable(false);
                }
            }
        }
    }

    private enableEditing() {
        let arr = this.ruleComponents.toArray();
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].rule.id) {
                arr[i].setEditable(true);
            }
        }
    }
}
