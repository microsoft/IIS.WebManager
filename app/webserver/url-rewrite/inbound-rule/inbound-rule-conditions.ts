import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';

import { InboundRule, Condition, MatchType } from '../url-rewrite';

@Component({
    selector: 'inbound-rule-conditions',
    template: `
        <div *ngIf="rule">
            <fieldset>
                <label>Match</label>
                <enum [(model)]="rule.condition_match_constraints">
                    <field name="All" value="match_all"></field>
                    <field name="Any" value="match_any"></field>
                </enum>
            </fieldset>
            <fieldset>
                <label>Keep Capture Groups</label>
                <switch [(model)]="rule.track_all_captures">
                    {{rule.track_all_captures ? 'Yes' : 'No'}}
                </switch>
            </fieldset>

            <button (click)="add()" class="create"><span>Add</span></button>
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
        con.pattern = ""
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
        <div *ngIf="condition && !_editing" class="grid-item row">
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
                        <i class="fa fa-ellipsis-h"></i>
                    </button>
                    <selector #selector [right]="true">
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
            <div class="actions">
                <button class="no-border ok" [disabled]="!isValid()" title="Ok" (click)="onOk()"></button>
                <button class="no-border cancel" title="Cancel" (click)="onDiscard()"></button>
            </div>
            <fieldset class="name">
                <label>Server Variable</label>
                <input type="text" class="form-control" list="server-vars" [(ngModel)]="condition.input" />
                <datalist id="server-vars">
                    <option value="{ALL_HTTP}">
                    <option value="{ALL_RAW}">
                    <option value="{APP_POOL_ID}">
                    <option value="{APPL_MD_PATH}">
                    <option value="{APPL_PHYSICAL_PATH}">
                    <option value="{AUTH_PASSWORD}">
                    <option value="{AUTH_TYPE}">
                    <option value="{AUTH_USER}">
                    <option value="{CACHE_URL}">
                    <option value="{CERT_COOKIE}">
                    <option value="{CERT_FLAGS}">
                    <option value="{CERT_ISSUER}">
                    <option value="{CERT_KEYSIZE}">
                    <option value="{CERT_SECRETKEYSIZE}">
                    <option value="{CERT_SERIALNUMBER}">
                    <option value="{CERT_SERVER_ISSUER}">
                    <option value="{CERT_SERVER_SUBJECT}">
                    <option value="{CERT_SUBJECT}">
                    <option value="{CONTENT_LENGTH}">
                    <option value="{CONTENT_TYPE}">
                    <option value="{GATEWAY_INTERFACE}">
                    <option value="{HTTP_ACCEPT}">
                    <option value="{HTTP_ACCEPT_ENCODING}">
                    <option value="{HTTP_ACCEPT_LANGUAGE}">
                    <option value="{HTTP_CONNECTION}">
                    <option value="{HTTP_COOKIE}">
                    <option value="{HTTP_COOKIE}">
                    <option value="{HTTP_HOST}">
                    <option value="{HTTP_METHOD}">
                    <option value="{HTTP_REFERER}">
                    <option value="{HTTP_URL}">
                    <option value="{HTTP_USER_AGENT}">
                    <option value="{HTTP_VERSION}">
                    <option value="{HTTPS}">
                    <option value="{HTTPS_KEYSIZE}">
                    <option value="{HTTPS_SECRETKEYSIZE}">
                    <option value="{HTTP_SERVER_ISSUER}">
                    <option value="{HTTPS_SERVER_SUBJECT}">
                    <option value="{INSTANCE_ID}">
                    <option value="{INSTANCE_META_PATH}">
                    <option value="{LOCAL_ADDR}">
                    <option value="{LOGON_USER}">
                    <option value="{PATH_INFO}">
                    <option value="{PATH_TRANSLATE}">
                    <option value="{QUERY_STRING}">
                    <option value="{REMOTE_ADDR}">
                    <option value="{REMOTE_HOST}">
                    <option value="{REMOTE_PORT}">
                    <option value="{REMOTE_USER}">
                    <option value="{REQUEST_METHOD}">
                    <option value="{SCRIPT_NAME}">
                    <option value="{SCRIPT_TRANSLATED}">
                    <option value="{SERVER_NAME}">
                    <option value="{SERVER_PORT}">
                    <option value="{SERVER_PORT_SECURE}">
                    <option value="{SERVER_PROTOCOL}">
                    <option value="{SERVER_SOFTWARE}">
                    <option value="{SSI_EXEC_DISABLED}">
                    <option value="{UNENCODED_URL}">
                    <option value="{UNMAPPED_REMOTE_USER}">
                    <option value="{URL}">
                    <option value="{URL_PATH_INFO}">
                </datalist>
            </fieldset>
            <fieldset>
                <label>Match Type</label>
                <enum [(model)]="condition.negate">
                    <field name="Matches" value="false"></field>
                    <field name="Doesn't Match" value="true"></field>
                </enum>
            </fieldset>
            <fieldset class="name">
                <label>Pattern</label>
                <input type="text" class="form-control" [(ngModel)]="condition.pattern" />
            </fieldset>
            <fieldset>
                <label>Ignore Case</label>
                <checkbox2 [(model)]="condition.ignore_case">Ignore Case</checkbox2>
            </fieldset>
        </div>
    `,
    styles: [`
        fieldset {
            padding-left: 15px;
            padding-right: 15px;
        }
    `]
})
export class ConditionEditComponent {
    @Input() public condition: Condition;

    @Output() cancel: EventEmitter<any> = new EventEmitter<any>();
    @Output() save: EventEmitter<any> = new EventEmitter<any>();

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