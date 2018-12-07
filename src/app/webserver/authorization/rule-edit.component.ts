import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

import { AuthRule, AccessType } from './authorization'
import { AuthorizationService } from './authorization.service';

@Component({
    selector: 'edit-rule',
    template: `
        <div>
            <fieldset>
                <label class="inline-block">Access Type</label>
                <enum class="block" [disabled]="locked" [(model)]="rule.access_type">
                    <field name="Allow" value="allow"></field>
                    <field name="Deny" value="deny"></field>
                </enum>
            </fieldset> 
            <fieldset>
                <label>Users</label>
                <enum [disabled]="locked" [(model)]="_target">
                    <field name="All" value="*"></field>
                    <field name="Anonymous" value="?"></field>
                    <field name="Specific Users" value="users"></field>
                    <field name="Roles or Groups" value="roles"></field>
                </enum>
            </fieldset>
            <fieldset class="no-label" *ngIf="_target == 'roles' || _target == 'users'">   
                <div *ngIf="_target == 'roles'">
                    <input placeholder="ex: Administrators, Power Users" class="form-control name" type="text" [disabled]="locked" [(ngModel)]="_roles" />
                </div>
                <div *ngIf="_target == 'users'">
                    <input placeholder="ex: Administrator, Guest" class="form-control name" type="text" [disabled]="locked" [(ngModel)]="_users" />
                </div>
            </fieldset>
            <fieldset>
                <label class="inline-block">Use Specific HTTP Methods</label>
                <tooltip>
                    When turned on, the rule will only be applied to requests that use one of the listed HTTP methods.
                </tooltip>
                <switch class="block" [model]="!_allVerbs" (modelChange)="_allVerbs=!$event">{{_allVerbs ? "No" : "Yes"}}</switch>
            </fieldset>
            <fieldset class="no-label" *ngIf="!_allVerbs">
                <input placeholder="ex: GET, PUT, POST, DELETE" class="form-control name" type="text" [disabled]="locked" [(ngModel)]="rule.verbs" />
            </fieldset>
            <p class="pull-right">
                <button [disabled]="!isValid()" class="ok" (click)="onOk()">OK</button>
                <button (click)="onDiscard()" class="cancel">Cancel</button>
            </p>
        </div>
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

        p {
            margin: 20px 0;
        }
    `]
})
export class RuleEditComponent implements OnInit {
    @Input() rule: AuthRule;
    @Input() locked: boolean;
    @Output() cancel: EventEmitter<any> = new EventEmitter<any>();
    @Output() save: EventEmitter<any> = new EventEmitter<any>();

    private _target: string;
    private _allVerbs: boolean;
    private _initializing: boolean;
    private _users: string = "";
    private _roles: string = "";

    constructor(private _service: AuthorizationService) {
    }

    public ngOnInit() {
        this._allVerbs = (this.rule.verbs == "");
        this.setupTarget();
    }

    private isValid() {
        return (this._target == "*") ||
            (this._target == "?") ||
            (this._target == "users" && this._users != null && this._users != "") ||
            (this._target == "roles" && this._roles != null && this._roles != "");
    }

    private onOk() {

        switch (this._target) {
            case "*":
            case "?":
                this.rule.users = this._target;
                this.rule.roles = "";
                break;
            case "users":
                this.rule.roles = "";
                this.rule.users = this._users;
                break;
            case "roles":
                this.rule.users = "";
                this.rule.roles = this._roles;
                break;
            default:
                break;
        }

        if (this._allVerbs) {
            this.rule.verbs = "";
        }
        else if (this.rule.verbs == "") {
            this._allVerbs = true;
        }

        if (!this.isValid()) {
            return;
        }

        this.save.emit(this.rule);
    }

    private onDiscard() {
        this._users = null;
        this._roles = null;
        this.cancel.emit();
    }

    private setupTarget() {
        if (this.rule.users == "*" || this.rule.users == "?") {
            this._target = this.rule.users;
        }
        else if (this.rule.roles) {
            this._target = "roles";
            this._roles = this.rule.roles;
        }
        else {
            this._target = "users";
            this._users = this.rule.users;
        }
    }

    private targetName() {
        switch (this._target) {
            case "*":
                return "All";
            case "?":
                return "Anonymous";
            case "users":
                return this.rule.users;
            case "roles":
                return this.rule.roles;
        }
    }
}
