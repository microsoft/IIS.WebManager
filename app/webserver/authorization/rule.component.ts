
import {Component, Input, Output, EventEmitter, ViewChild, OnInit} from '@angular/core';

import {AuthRule, AccessType} from './authorization'

@Component({
    selector: 'rule',
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
    `],
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
                <fieldset class="col-xs-8 col-sm-8 col-md-2">
                    <label class="visible-xs visible-sm">Access Type</label>
                    <label class="hidden-xs hidden-sm editing">Access Type</label>
                    <i class="fa fa-circle green hidden-xs hidden-sm" *ngIf="_allowAccess && !_editing"></i>
                    <i class="fa fa-ban red hidden-xs hidden-sm" *ngIf="!_allowAccess && !_editing"></i>
                    <span *ngIf="!_editing">{{_allowAccess ? "Allow" : "Deny"}}</span>
                    <switch class="block" *ngIf="_editing" [disabled]="locked" [(model)]="_allowAccess">{{_allowAccess ? "Allow" : "Deny"}}</switch>
                </fieldset> 

                <fieldset class="col-xs-12 col-sm-12 col-md-4" *ngIf="!_editing">
                    <label class="visible-xs visible-sm">Users</label>
                    <span *ngIf="!_editing">{{targetName()}}</span>
                </fieldset>
                <fieldset class="col-xs-6 col-sm-6 col-md-2" *ngIf="_editing">
                    <label class="visible-xs visible-sm">Users</label>            
                    <label class="hidden-xs hidden-sm editing">Users</label>
                    <select class="form-control" [disabled]="locked" [(ngModel)]="_target">
                        <option value="*">All</option>
                        <option value="?">Anonymous</option>
                        <option value="users">Specified Users</option>
                        <option value="roles">Roles or Groups</option>
                    </select>
                </fieldset>
                <fieldset class="col-xs-6 col-sm-6 col-md-2" *ngIf="_editing">   
                    <label class="visible-xs visible-sm">&nbsp;</label>         
                    <label class="hidden-xs hidden-sm editing">&nbsp;</label>
                    <div *ngIf="_target == 'roles'">
                        <input class="form-control" *ngIf="_editing" type="text" [disabled]="locked" [(ngModel)]="rule.roles" throttle />
                    </div>
                    <div *ngIf="_target == 'users'">
                        <input class="form-control" *ngIf="_editing" type="text" [disabled]="locked" [(ngModel)]="rule.users" throttle />
                    </div>
                </fieldset>

                <fieldset class="col-xs-12 col-sm-12 col-md-4" *ngIf="!_editing">
                    <label class="visible-xs visible-sm">Http Methods</label>
                    <span *ngIf="!_editing">{{_allVerbs ? "All" : rule.verbs}}</span>
                </fieldset>
                <fieldset class="col-xs-12 col-sm-12 col-md-4" *ngIf="_editing">
                    <label class="visible-xs visible-sm">Http Methods</label>
                    <label class="hidden-xs hidden-sm editing">Http Methods</label>
                    <div class="row">
                        <div class="col-xs-12 col-md-3">
                            <checkbox2 *ngIf="_editing" [disabled]="locked" [(model)]="_allVerbs" class="checkbox">All</checkbox2>
                        </div>
                        <div class="col-xs-12 col-md-9" *ngIf="!_allVerbs">
                            <label class="visible-xs visible-sm">&nbsp;</label>
                            <input class="form-control" type="text" [disabled]="locked" [(ngModel)]="rule.verbs" throttle />
                        </div>
                    </div>
                </fieldset>                    
            </div>
        </div>
    `
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
    private _allowAccess: boolean;

    public ngOnInit() {
        this._initializing = !("id" in this.rule) || (this.rule.id == "");
        this._editing = this._initializing;
        this._allowAccess = (this.rule.access_type == AccessType.Allow);
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

        this.rule.access_type = (this._allowAccess) ? AccessType.Allow : AccessType.Deny;

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
