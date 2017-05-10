
import {Component, Input, Output, EventEmitter, ViewChild, OnInit} from '@angular/core';

import {AuthRule, AccessType} from './authorization'

@Component({
    selector: 'rule',
    template: `
        <div *ngIf="rule">    
            <div class="row grid-item" [class.background-editing]="_editing">                
                <div class="actions">
                    <button class="no-border" title="Ok" *ngIf="_editing" [disabled]="locked || !isValid() || null" (click)="onOk()">
                        <i class="fa fa-check blue"></i>
                    </button>
                    <button class="no-border" title="Cancel" *ngIf="_editing" (click)="onDiscard()">
                        <i class="fa fa-times red"></i>
                    </button>
                    <button class="no-border" title="Edit" [class.inactive]="!_editable" *ngIf="!_editing" (click)="onEdit()">
                        <i class="fa fa-pencil color-active"></i>
                    </button>
                    <button class="no-border" *ngIf="rule.id" title="Delete" [disabled]="locked || _editing" [class.inactive]="!_editable" (click)="onDelete()">
                        <i class="fa fa-trash-o red"></i>
                    </button>
                </div>
                <div *ngIf="!_editing">
                    <fieldset class="col-xs-8 col-sm-8 col-md-2">
                        <label class="visible-xs visible-sm">Access Type</label>
                        <i class="fa fa-circle green hidden-xs hidden-sm" *ngIf="rule.access_type == 'allow'"></i>
                        <i class="fa fa-ban red hidden-xs hidden-sm" *ngIf="rule.access_type == 'deny'"></i>
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
                <div *ngIf="_editing" class="col-pad">
                    <fieldset>
                        <label>Access Type</label>
                        <enum [disabled]="locked" [(model)]="rule.access_type">
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
                            <input placeholder="ex: Administrators, Power Users" class="form-control name" type="text" [disabled]="locked" [(ngModel)]="rule.roles" />
                        </div>
                        <div *ngIf="_target == 'users'">
                            <input placeholder="ex: Administrator, Guest" class="form-control name" type="text" [disabled]="locked" [(ngModel)]="rule.users" />
                        </div>
                    </fieldset>
                    <fieldset>
                        <label>Use Specific HTTP Methods</label>
                        <switch [model]="!_allVerbs" (modelChange)="_allVerbs=!$event">{{_allVerbs ? "No" : "Yes"}}</switch>
                    </fieldset>
                    <fieldset class="no-label" *ngIf="!_allVerbs">
                        <input placeholder="ex: GET, PUT, POST, DELETE" class="form-control name" type="text" [disabled]="locked" [(ngModel)]="rule.verbs" />
                    </fieldset>
                </div>
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

        .col-pad {
            padding-left: 15px;
        }

        fieldset.no-label {
            padding-top: 0;
        }
    `]
})
export class RuleComponent implements OnInit {    
    @Input() rule: AuthRule;
    @Input() locked: boolean;

    @ViewChild('roles') roles;

    @Output() modelChanged: EventEmitter<any> = new EventEmitter();
    @Output() add: EventEmitter<any> = new EventEmitter();
    @Output() delete: EventEmitter<any> = new EventEmitter();
    @Output() edit: EventEmitter<any> = new EventEmitter();
    @Output() discard: EventEmitter<any> = new EventEmitter();

    private _target: string;
    private _editing: boolean;
    private _initializing: boolean;
    private _editable: boolean = true;
    private _allVerbs: boolean;

    public ngOnInit() {
        this._initializing = !("id" in this.rule) || (this.rule.id == "");
        this._editing = this._initializing;
        this._allVerbs = (this.rule.verbs == "");

        if (!this._initializing) {
            if (this.rule.users == "*" || this.rule.users == "?") {
                this._target = this.rule.users;
                this.rule.users = "";
            }
            else if (this.rule.roles) {
                this._target = "roles";
            }
            else {
                this._target = "users";
            }
        }
        else {
            this._target = "*";
        }
    }

    public setEditable(val: boolean) {
        this._editable = val;
    }

    private onEdit() {
        this._editing = true;
        this.edit.emit(null);
    }

    private onOk() {

        if (!this._editing) {
            return;
        }

        switch (this._target) {
            case "*":
            case "?":
                this.rule.users = this._target;
                this.rule.roles = "";
                break;
            case "users":
                this.rule.roles = "";
                break;
            case "roles":
                this.rule.users = "";
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

        if (this._initializing) {
            this._initializing = false;
            this.add.emit(null);
        }
        else {
            this.modelChanged.emit(null);
        }         

        this._editing = false;
    }

    private onDiscard() {
        this.discard.emit(null);
    }

    private onDelete() {
        this.delete.emit(null);
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

    private isValid() {
        return (this._target == "*") ||
               (this._target == "?") ||
               (this._target == "users" && this.rule.users != null && this.rule.users != "") ||
               (this._target == "roles" && this.rule.roles != null && this.rule.roles != "");
    }
}
