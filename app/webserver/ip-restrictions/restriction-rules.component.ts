import { Component, Input, Output, EventEmitter, ElementRef, ViewChildren, QueryList, OnInit, OnDestroy, OnChanges, SimpleChange } from '@angular/core';
import { NgModel } from '@angular/forms';

import { Subscription } from 'rxjs/Subscription';

import { IpRestrictionsService } from './ip-restrictions.service';
import { DiffUtil } from '../../utils/diff';
import { RestrictionRule, IpRestrictions } from './ip-restrictions'

@Component({
    selector: 'restriction-rule',
    template: `
        <div class="row grid-item" [class.background-editing]="_editing">

            <div class="actions">
                <button class="no-border" title="Ok" *ngIf="_editing" [disabled]="!isValid() || null" (click)="onSave()">
                    <i class="fa fa-check blue"></i>
                </button>
                <button enabled class="no-border" title="Cancel" *ngIf="_editing" (click)="onDiscard()">
                    <i class="fa fa-times red"></i>
                </button>
                <button enabled class="no-border" title="Edit" [class.inactive]="!_editable" *ngIf="!_editing" (click)="onEdit()">
                    <i class="fa fa-pencil blue"></i>
                </button>
                <button class="no-border" *ngIf="model.id" title="Delete" [class.inactive]="!_editable || _editing" (click)="onDelete()">
                    <i class="fa fa-trash-o red"></i>
                </button>
            </div>

            <fieldset class="col-xs-8 col-md-2">
                <label class="visible-xs visible-sm">Status</label>
                <label class="hidden-xs hidden-sm editing">Status</label>
                <i class="fa fa-circle green hidden-xs hidden-sm" *ngIf="model.allowed && !_editing"></i>
                <i class="fa fa-ban red hidden-xs hidden-sm" *ngIf="!model.allowed && !_editing"></i>
                <span *ngIf="!_editing">{{model.allowed ? "Allow" : "Deny"}}</span>
                <switch class="block" *ngIf="_editing" [(model)]="model.allowed">{{model.allowed ? "Allow" : "Deny"}}</switch>
                <div *ngIf="!_editing">
                    <br class="visible-xs visible-sm" />
                </div>
            </fieldset>

            <fieldset class="col-xs-12 col-md-3">
                <label class="visible-xs visible-sm">IP Address</label>
                <label class="hidden-xs hidden-sm editing">IP Address</label>
                <span *ngIf="!_editing">{{model.ip_address}}</span>
                <input class="form-control" type="text" [(ngModel)]="model.ip_address" required pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$" />
                <div *ngIf="!_editing">
                    <br class="visible-xs visible-sm" />
                </div>
            </fieldset>

            <fieldset class="col-xs-12 col-md-3">
                <label class="visible-xs visible-sm">Subnet Mask</label>
                <label class="hidden-xs hidden-sm editing">Subnet Mask</label>
                <span *ngIf="!_editing">{{model.subnet_mask}}</span>
                <input class="form-control" type="text" [(ngModel)]="model.subnet_mask" required />
                <div *ngIf="!_editing">
                    <br class="visible-xs visible-sm" />
                </div>
            </fieldset>

            <fieldset class="col-xs-12 col-md-2" *ngIf="enableDomainName && (_editing || model.domain_name != '')">
                <label class="visible-xs visible-sm">Domain Name</label>
                <label class="hidden-xs hidden-sm editing">Domain Name</label>
                <span *ngIf="!_editing">{{model.domain_name}}</span>
                <input class="form-control" type="text" [(ngModel)]="model.domain_name" />
                <div *ngIf="!_editing">
                    <br class="visible-xs visible-sm" />
                </div>
            </fieldset>
        </div>
    `,
    styles: [`
        .fa-circle,
        .fa-ban {
            font-size: 20px;
            margin-right: 10px;
            padding-left: 1px
        }

        .grid-item:not(.background-editing) fieldset {
            padding-top: 5px;
            padding-bottom: 0;
        }
    `]
})
export class RestrictionRuleComponent implements OnChanges, OnInit {
    @Input() model: RestrictionRule;
    @Input() enableDomainName: boolean;

    @Output() edit: EventEmitter<any> = new EventEmitter();
    @Output() discard: EventEmitter<any> = new EventEmitter();

    @ViewChildren(NgModel) private _validators: QueryList<NgModel>;

    private _editable: boolean = true;
    private _editing: boolean = false;
    private _original: RestrictionRule;

    constructor(private _service: IpRestrictionsService) {
    }

    public ngOnInit() {
        this._editing = !this.model.id;
    }

    public ngOnChanges(changes: { [key: string]: SimpleChange; }): any {
        if (changes["model"]) {
            this.setModel(changes["model"].currentValue);
        }
    }

    onSave() {
        this._editing = false;
        if (this.model.id) {
            let changes = DiffUtil.diff(this._original, this.model);
            if (Object.keys(changes).length > 0) {
                this._service.updateRule(this.model, changes)
                    .then(() => this.setModel(this.model));
            }
            this.discard.emit(null);
        }
        else {
            this._service.addRule(this.model);
            this.discard.emit(null);
        }
    }

    onEdit() {
        this._editing = true;
        this.edit.emit(null);
    }

    onDiscard() {
        this._editing = false;
        for (let key of Object.keys(this._original)) {
            this.model[key] = JSON.parse(JSON.stringify(this._original[key] || null));
        }

        this.discard.emit(null);
    }

    onDelete() {
        if (confirm("Are you sure you want to delete this rule?\nIp Address: " + this.model.ip_address)) {
            this._service.deleteRule(this.model);
        }
    }

    setEditable(val: boolean) {
        this._editable = val;
    }

    isValid() {
        var valid = !!this._validators;

        if (this._validators) {
            this._validators.forEach(v => {
                if (!v.valid) {
                    valid = false;
                }
            });
        }

        return valid;
    }

    private setModel(model: RestrictionRule) {
        this.model = model;
        this._original = JSON.parse(JSON.stringify(this.model));
    }
}

@Component({
    selector: 'restriction-rules',
    template: `
        <fieldset>
            <label>Allow Unlisted</label>
            <switch class="block" [(model)]="ipRestrictions.allow_unlisted" (modelChanged)="onModelChanged()">{{ipRestrictions.allow_unlisted ? "Yes" : "No"}}</switch>
        </fieldset>
        <fieldset>
            <button class="create" (click)="createRule()" [class.inactive]="_editing || _newRule"><i class="fa fa-plus blue"></i><span>Add</span></button>
            <div class="container-fluid">
                <div class="row hidden-xs hidden-sm border-active grid-list-header" [hidden]="rules.length == 0">
                    <label class="col-md-2">Status</label>
                    <label class="col-md-3">IP Address</label>
                    <label class="col-md-3">Subnet Mask</label>
                    <label class="col-md-2" *ngIf="ipRestrictions.enable_reverse_dns">Domain Name</label>
                </div>
            </div>
            <ul class="grid-list container-fluid">
                <li *ngIf="_newRule">
                    <restriction-rule [model]="_newRule"
                                      [enableDomainName]="ipRestrictions.enable_reverse_dns"
                                      (discard)="onDiscardNew()">
                    </restriction-rule>
                </li>
                <li *ngFor="let rule of rules; let i = index;">
                    <restriction-rule [model]="rule"
                                      [enableDomainName]="ipRestrictions.enable_reverse_dns" 
                                      (edit)="edit(i)"
                                      (discard)="discard()">
                    </restriction-rule>
                </li>
            </ul>
        </fieldset>
    `,
    styles: [`
        li select,
        li input {
            display: inline;
        }

        .grid-list > li .actions {
            z-index: 1;
            position: absolute;
            right: 0;
        }
        .grid-list > li.background-editing .actions {
            top: 32px;
        }

        fieldset:first-of-type {
            margin-bottom: 15px;
        }
    `]
})
export class RestrictionRulesComponent implements OnInit, OnDestroy {
    rules: Array<RestrictionRule>;

    private _editing: boolean;
    private _newRule: RestrictionRule;
    private _subscriptions: Array<Subscription> = [];

    @Input() ipRestrictions: IpRestrictions;
    @Output() modelChanged: any = new EventEmitter();

    @ViewChildren(RestrictionRuleComponent) private _ruleComponents: QueryList<RestrictionRuleComponent>;

    constructor(private _service: IpRestrictionsService) {
    }

    ngOnInit() {
        this._subscriptions.push(this._service.rules.subscribe(rules => this.setRules(rules)));
        this._service.loadRules();
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(sub => sub.unsubscribe());
    }

    onModelChanged() {
        this.modelChanged.emit();
    }

    createRule() {
        if (this._newRule) {
            return;
        }

        this._newRule = new RestrictionRule();

        this._newRule.ip_address = "";
        this._newRule.allowed = false;
        this._newRule.subnet_mask = "255.255.255.255";
        this.disableEditingExcept(-1); // New rule is not yet added to ruleComponents, therefore disable editing for all
    }

    private onDiscardNew() {
        this._newRule = null;
        this.enableEditing();
    }

    edit(index) {
        this._editing = true;
        this.disableEditingExcept(index);
    }

    discard() {
        this._editing = false;
        this.enableEditing();
    }

    private setRule(index, rule) {
        this.rules[index] = rule;
    }

    private disableEditingExcept(index) {
        let arr = this._ruleComponents.toArray();
        for (var i = 0; i < arr.length; i++) {
            if (i !== index) {
                if (arr[i].model.id) {
                    arr[i].setEditable(false);
                }
            }
        }
    }

    private enableEditing() {
        let arr = this._ruleComponents.toArray();
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].model.id) {
                arr[i].setEditable(true);
            }
        }
    }

    private setRules(rules: Array<RestrictionRule>) {
        this.rules = rules;
    }
}
