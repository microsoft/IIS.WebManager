import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';

import { InboundRule, ServerVariableAssignment, MatchType, IIS_SERVER_VARIABLES } from '../url-rewrite';

@Component({
    selector: 'inbound-rule-variables',
    template: `
        <div *ngIf="rule">
            <button (click)="add()" class="create"><span>Add Server Variable</span></button>
            <div class="container-fluid">
                <div class="row hidden-xs border-active grid-list-header">
                    <label class="col-sm-3 col-lg-2">Name</label>
                    <label class="col-sm-3 col-lg-2">Value</label>
                    <label class="col-sm-3 col-lg-2">Replace</label>
                </div>
            </div>

            <ul class="grid-list container-fluid">
                <li *ngIf="_newServerVariable">
                    <variable-edit [variable]="_newServerVariable" (save)="saveNew($event)" (cancel)="discardNew()"></variable-edit>
                </li>
                <li *ngFor="let variable of rule.server_variables; let i = index;">
                    <inbound-rule-variable [variable]="variable" (delete)="onDelete(i)"></inbound-rule-variable>
                </li>
            </ul>
        </div>
    `
})
export class InboundRuleVariablesComponent {
    @Input() public rule: InboundRule;

    private _newServerVariable: ServerVariableAssignment;

    private add() {
        let variable = new ServerVariableAssignment();
        variable.name = "";
        variable.value = "";
        variable.replace = true;
        this._newServerVariable = variable;
    }

    private saveNew(variable: ServerVariableAssignment) {
        this.rule.server_variables.push(variable);
        this._newServerVariable = null;
    }

    private discardNew() {
        this._newServerVariable = null;
    }

    private onDelete(index: number) {
        this.rule.server_variables.splice(index, 1);
    }
}

@Component({
    selector: 'inbound-rule-variable',
    template: `
        <div *ngIf="variable && !_editing" class="grid-item row" (dblclick)="edit()">
            <div class="col-sm-3 col-lg-2 valign">
                {{variable.name}}
            </div>
            <div class="col-sm-3 col-lg-2 valign">
                {{variable.value}}
            </div>
            <div class="col-sm-3 col-lg-2 valign">
                {{variable.replace}}
            </div>
            <div class="actions">
                <div class="action-selector">
                    <button title="More" (click)="selector.toggle()" (dblclick)="$event.preventDefault()" [class.background-active]="(selector && selector.opened) || false">
                        <i aria-hidden="true" class="fa fa-ellipsis-h"></i>
                    </button>
                    <selector aria-hidden="true" #selector [right]="true">
                        <ul>
                            <li><button #menuButton class="edit" title="Edit" (click)="edit()">Edit</button></li>
                            <li><button #menuButton class="delete" title="Delete" (click)="delete()">Delete</button></li>
                        </ul>
                    </selector>
                </div>
            </div>
        </div>
        <variable-edit
            *ngIf="_editing"
            [variable]="variable"
            (save)="onSave()"
            (cancel)="onCancel()"></variable-edit>
    `
})
export class InboundRuleVariableComponent {
    @Input() public variable: ServerVariableAssignment;
    @Output('delete') deleteEvent: EventEmitter<any> = new EventEmitter<any>();

    private _editing: boolean;

    private edit() {
        this._editing = true;
    }

    private onSave() {
        this._editing = false;
    }

    private onCancel() {
        this._editing = false;
    }

    private delete() {
        this.deleteEvent.next();
    }
}

@Component({
    selector: 'variable-edit',
    template: `
        <div *ngIf="variable" class="grid-item row background-editing">
            <fieldset class="col-lg-10 col-md-10 col-sm-8 col-xs-6 overflow-visible">
                <fieldset class="name">
                    <label>Name</label>
                    <input autofocus type="text" required class="form-control" list="server-vars" [(ngModel)]="variable.name" />
                    <datalist id="server-vars">
                        <option *ngFor="let variable of _serverVariables" value="{{variable}}">
                    </datalist>
                </fieldset>
                <fieldset class="name">
                    <label>Value</label>
                    <input type="text" required class="form-control" [(ngModel)]="variable.value" />
                </fieldset>
                <fieldset>
                    <switch label="Replace" [(model)]="variable.replace">{{variable.replace ? 'Yes' : 'No'}}</switch>
                </fieldset>
            </fieldset>
            <div class="actions">
                <button class="no-border ok" [disabled]="!isValid()" title="Ok" (click)="onOk()"></button>
                <button class="no-border cancel" title="Cancel" (click)="onDiscard()"></button>
            </div>
        </div>
    `,
    styles: [`
        fieldset {
            padding-left: 15px;
            padding-right: 15px;
        }
    `]
})
export class VariableEditComponent {
    @Input() public variable: ServerVariableAssignment;

    @Output() cancel: EventEmitter<any> = new EventEmitter<any>();
    @Output() save: EventEmitter<any> = new EventEmitter<any>();

    private _serverVariables: Array<string> = IIS_SERVER_VARIABLES;

    private isValid(): boolean {
        return !!this.variable.name && !!this.variable.value;
    }

    private onDiscard() {
        this.cancel.emit();
    }

    private onOk() {
        this.save.emit(this.variable);
    }
}