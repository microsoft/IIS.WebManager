import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChange } from '@angular/core';

import { NotificationService } from '../../notification/notification.service';
import { AuthRule, AccessType } from './authorization'
import { AuthorizationService } from './authorization.service';

@Component({
    selector: 'rule',
    template: `
        <div *ngIf="rule" class="row grid-item" [class.background-selected]="_editing" (dblclick)="edit()">
            <div class="actions">
                <div class="action-selector">
                    <button title="More" (click)="selector.toggle()" (dblclick)="$event.preventDefault()" [class.background-active]="(selector && selector.opened) || _editing || false">
                        <i aria-hidden="true" class="fa fa-ellipsis-h"></i>
                    </button>
                    <selector #selector [right]="true" [isQuickMenu]="true">
                        <ul>
                            <li><button #menuButton class="edit" title="Edit" [disabled]="locked" (click)="edit()">Edit</button></li>
                            <li><button #menuButton class="delete" title="Delete" [disabled]="locked" (click)="delete()">Delete</button></li>
                        </ul>
                    </selector>
                </div>
            </div>
            <fieldset class="col-xs-8 col-sm-8 col-md-2">
                <label class="visible-xs visible-sm">Access Type</label>
                <i aria-hidden="true" class="fa fa-circle green hidden-xs hidden-sm" *ngIf="rule.access_type == 'allow'"></i>
                <i aria-hidden="true" class="fa fa-ban red hidden-xs hidden-sm" *ngIf="rule.access_type == 'deny'"></i>
                <span class="capitalize">{{rule.access_type}}</span>
            </fieldset> 
            <fieldset class="col-xs-12 col-sm-12 col-md-4">
                <label class="visible-xs visible-sm">Users</label>
                <span>{{targetName()}}</span>
            </fieldset>
            <fieldset class="col-xs-12 col-sm-12 col-md-4">
                <label class="visible-xs visible-sm">Http Methods</label>
                <span>{{_allVerbs ? "All" : rule.verbs}}</span>
            </fieldset>
        </div>
        <selector #editSelector [opened]="true" *ngIf="_editing" class="container-fluid" (hide)="discard()">
            <edit-rule [rule]="rule" (save)="save($event)" (cancel)="discard()"></edit-rule>
        </selector>
    `,
    styles: [`
        .checkbox {
            margin: 6px 0 0 0;
        }

        .fa-circle,
        .fa-ban {
            font-size: 20px;
            margin-right: 10px;
        }

        .grid-item:not(.background-editing) fieldset {
            padding-top: 5px;
            padding-bottom: 0;
        }

        label.visible-xs {
            margin-bottom: 5px;
        }

        .column-pad {
            padding-left: 15px;
        }

        fieldset.no-label {
            padding-top: 0;
        }
    `]
})
export class RuleComponent implements OnInit, OnChanges {
    @Input() rule: AuthRule;
    @Input() locked: boolean;

    private _target: string;
    private _editing: boolean;
    private _initializing: boolean;
    private _allVerbs: boolean;
    private _original: AuthRule;

    constructor(private _service: AuthorizationService, private _notificationService: NotificationService) {
    }

    ngOnChanges(changes: { [key: string]: SimpleChange; }): any {
        if (changes["rule"]) {
            this._original = JSON.parse(JSON.stringify(changes["rule"].currentValue));
        }
    }

    public ngOnInit() {
        this._initializing = !("id" in this.rule) || (this.rule.id == "");
        this._editing = this._initializing;
        this._allVerbs = (this.rule.verbs == "");
    }

    private edit() {
        this._editing = true;
    }

    private delete() {
        this._notificationService.confirm("Delete Rule", "Are you sure you want to delete this authorization rule?")
            .then(confirmed => confirmed && this._service.deleteRule(this.rule));
    }

    private save() {
        this._service.saveRule(this.rule)
            .then(() => this._original = JSON.parse(JSON.stringify(this.rule)));
        this._editing = false;
    }

    private discard() {
        this.rule = JSON.parse(JSON.stringify(this._original));
        this._editing = false;
    }

    private targetName() {
        if (this.rule.users == "*") {
            return "All";
        }
        else if (this.rule.users == "?") {
            return "Anonymous";
        }
        else if (this.rule.roles) {
            return this.rule.roles;
        }
        else {
            return this.rule.users;
        }
    }
}
