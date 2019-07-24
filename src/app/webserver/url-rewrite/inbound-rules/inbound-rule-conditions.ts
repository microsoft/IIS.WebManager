import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';

import { InboundRule, Condition, MatchType, IIS_SERVER_VARIABLES } from '../url-rewrite';

@Component({
    selector: 'inbound-rule-conditions',
    template: `
        <div *ngIf="rule">
            <fieldset>
                <label>Match</label>
                <enum [(model)]="rule.condition_match_constraints">
                    <field name="All" value="match_all" title="All conditions must match for the rule to match"></field>
                    <field name="Any" value="match_any" title="Atleast one condition must match for the rule to match"></field>
                </enum>
            </fieldset>
            <fieldset>
                <div>
                    <label class="inline-block">Keep All Back References</label>
                    <tooltip>
                        Specifies whether to keep back references for all matching conditions or only the last condition evaulated.
                    </tooltip>
                </div>
                <switch [(model)]="rule.track_all_captures">
                    {{rule.track_all_captures ? 'Yes' : 'No'}}
                </switch>
            </fieldset>

            <button (click)="add()" class="create"><span>Add Condition</span></button>
            <div class="container-fluid">
                <div class="row hidden-xs border-active grid-list-header">
                    <label class="col-sm-3 col-lg-2">Server Variable</label>
                    <label class="col-sm-3 col-lg-2">Match Type</label>
                    <label class="col-sm-3">Pattern</label>
                </div>
            </div>

            <ul class="grid-list container-fluid">
                <li *ngIf="_newCondition">
                    <condition-edit [condition]="_newCondition" (save)="saveNew($event)" (cancel)="discardNew()"></condition-edit>
                </li>
                <li *ngFor="let condition of rule.conditions; let i = index;">
                    <inbound-rule-condition [condition]="condition" (delete)="onDelete(i)"></inbound-rule-condition>
                </li>
            </ul>
        </div>
    `,
    styles: [`
        .create {
            margin-top: 50px;
        }
    `]
})
export class InboundRuleConditionsComponent {
    @Input() public rule: InboundRule;

    private _newCondition: Condition;

    private add() {
        let con = new Condition();
        con.ignore_case = true;
        con.match_type = MatchType.Pattern;
        con.negate = false;
        con.input = "";
        con.pattern = "(.*)"
        this._newCondition = con;
    }

    private saveNew(condition: Condition) {
        this.rule.conditions.push(condition);
        this._newCondition = null;
    }

    private discardNew() {
        this._newCondition = null;
    }

    private onDelete(index: number) {
        this.rule.conditions.splice(index, 1);
    }
}

@Component({
    selector: 'inbound-rule-condition',
    template: `
        <div *ngIf="condition && !_editing" class="grid-item row" (dblclick)="edit()">
            <div class="col-sm-3 col-lg-2 valign">
                {{condition.input}}
            </div>
            <div class="col-sm-3 col-lg-2 valign">
                {{condition.negate ? "Doesn't Match" : "Matches"}}
            </div>
            <div class="col-sm-3 valign">
                {{condition.pattern}}
            </div>
            <div class="actions">
                <div class="action-selector">
                    <button title="More" (click)="selector.toggle()" (dblclick)="$event.preventDefault()" [class.background-active]="(selector && selector.opened) || false">
                        <i aria-hidden="true" class="fa fa-ellipsis-h"></i>
                    </button>
                    <selector #selector [right]="true" [isQuickMenu]="true">
                        <ul>
                            <li><button #menuButton class="edit" title="Edit" (click)="edit()">Edit</button></li>
                            <li><button #menuButton class="delete" title="Delete" (click)="delete()">Delete</button></li>
                        </ul>
                    </selector>
                </div>
            </div>
        </div>
        <condition-edit
            *ngIf="_editing"
            [condition]="condition"
            (save)="onSave()"
            (cancel)="onCancel()"></condition-edit>
    `
})
export class InboundRuleConditionComponent {
    @Input() public condition: Condition;
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
    selector: 'condition-edit',
    template: `
        <div *ngIf="condition" class="grid-item row background-editing">
            <fieldset class="col-lg-10 col-md-10 col-sm-8 col-xs-6 overflow-visible">
                <fieldset class="name">
                    <label>Server Variable</label>
                    <input autofocus type="text" required class="form-control" list="server-vars" [(ngModel)]="condition.input" />
                    <datalist id="server-vars">
                        <option *ngFor="let variable of _serverVariables" value="{{'{' + variable + '}'}}">
                    </datalist>
                </fieldset>
                <fieldset class="name">
                    <div>
                        <label class="inline-block">Pattern</label>
                        <text-toggle onText="Matches" offText="Doesn't Match" [on]="false" [off]="true" [(model)]="condition.negate"></text-toggle>
                        <text-toggle onText="Case Insensitive" offText="Case Sensitive" [(model)]="condition.ignore_case"></text-toggle>
                    </div>
                    <input type="text" required class="form-control" [(ngModel)]="condition.pattern" />
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

        .inline-block,
        text-toggle {
            margin-right: 20px;
        }
    `]
})
export class ConditionEditComponent {
    @Input() public condition: Condition;

    @Output() cancel: EventEmitter<any> = new EventEmitter<any>();
    @Output() save: EventEmitter<any> = new EventEmitter<any>();

    private _serverVariables: Array<string> = IIS_SERVER_VARIABLES;

    private isValid(): boolean {
        return !!this.condition.input && !!this.condition.pattern;
    }

    private onDiscard() {
        this.cancel.emit();
    }

    private onOk() {
        this.save.emit(this.condition);
    }
}