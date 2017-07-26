import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';

import { Selector } from '../../../common/selector';
import { InboundRule, ServerVariableAssignment, MatchType } from '../url-rewrite';

@Component({
    selector: 'inbound-rule-variables',
    template: `
        <div *ngIf="rule">
            <button (click)="add()" class="create"><span>Add</span></button>
            <div class="container-fluid">
                <div class="row hidden-xs border-active grid-list-header">
                    <label class="col-sm-3 col-lg-2">Name</label>
                    <label class="col-sm-3 col-lg-2">Value</label>
                    <label class="col-sm-3 col-lg-2">Replace</label>
                </div>
            </div>

            <ul class="grid-list container-fluid">
                <li *ngFor="let variable of rule.server_variables; let i = index;">
                    <inbound-rule-variable [variable]="variable"></inbound-rule-variable>
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
        variable.replace = false;
        this._newServerVariable = variable;
    }

    private addNew(variable: ServerVariableAssignment) {
        this.rule.server_variables.push(variable);
        this._newServerVariable = null;
    }

    private discardNew() {
        this._newServerVariable = null;
    }
}

@Component({
    selector: 'inbound-rule-variable',
    template: `
        <div *ngIf="variable" class="grid-item row">
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
                    <button title="More" (click)="openSelector($event)" (dblclick)="prevent($event)" [class.background-active]="(_selector && _selector.opened) || false">
                        <i class="fa fa-ellipsis-h"></i>
                    </button>
                    <selector [right]="true">
                        <ul>
                            <li><button class="edit" title="Edit">Edit</button></li>
                            <li><button class="delete" title="Delete">Delete</button></li>
                        </ul>
                    </selector>
                </div>
            </div>
        </div>
    `
})
export class InboundRuleVariableComponent {
    @Input() public variable: ServerVariableAssignment;

    @ViewChild(Selector) private _selector: Selector;

    private prevent(e: Event) {
        e.preventDefault();
    }

    private openSelector(e: Event) {
        this._selector.toggle();
    }
}