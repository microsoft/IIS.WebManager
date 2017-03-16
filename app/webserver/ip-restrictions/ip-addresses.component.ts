
import {Component, Input, Output, EventEmitter, QueryList, ViewChildren, OnInit} from '@angular/core';

import {IpRestrictions, RestrictionRule} from './ip-restrictions'
import {RestrictionRuleComponent} from './restriction-rules.component'

@Component({
    selector: 'ip-addresses',
    template: `
        <fieldset>
            <label>Proxy Mode</label>
            <switch class="block" [(model)]="model.enable_proxy_mode" (modelChanged)="onModelChanged()">{{model.enable_proxy_mode ? "On" : "Off"}}</switch>
        </fieldset>
        <fieldset>
            <label>Use Reverse DNS Lookup</label>
            <switch class="block" [(model)]="model.enable_reverse_dns" (modelChanged)="onModelChanged()">{{model.enable_reverse_dns ? "On" : "Off"}}</switch>
        </fieldset>
        <fieldset>
            <label>Unlisted IP Addresses</label>
            <switch class="block" [(model)]="model.allow_unlisted" (modelChanged)="onModelChanged()">{{model.allow_unlisted ? "Allow" : "Deny"}}</switch>
        </fieldset>

        <br />
        <fieldset>
            <button class="create" (click)="createRule()" [class.inactive]="_editing != -1"><i class="fa fa-plus blue"></i><span>Add</span></button>
            <div class="container-fluid">
                <div class="row hidden-xs hidden-sm border-active grid-list-header" [hidden]="rules.length == 0">
                    <label class="col-md-2">Status</label>
                    <label class="col-md-3">IP Address</label>
                    <label class="col-md-3">Subnet Mask</label>
                    <label class="col-md-2" *ngIf="model.enable_reverse_dns">Domain Name</label>
                </div>
            </div>
            <ul class="grid-list container-fluid">
                <li *ngFor="let rule of rules; let i = index;">
                    <restriction-rule [model]="rule" 
                                      [isEditing]="_editing == i" 
                                      [enableDomainName]="model.enable_reverse_dns" 
                                      (save)="onFinishEditing(i)"
                                      (edit)="edit(i)"
                                      (discard)="discard()"
                                      (delete)="onDelete(i)">
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
    `]
})
export class IpAddressesComponent implements OnInit {

    @Input() model: IpRestrictions;
    @Input() rules: Array<RestrictionRule>;
    @Input() originalRules: Array<RestrictionRule>;

    @Output() modelChange: any = new EventEmitter();
    @Output() addRule: any = new EventEmitter();
    @Output() deleteRule: any = new EventEmitter();
    @Output() changeRule: any = new EventEmitter();

    private _editing: number;

    @ViewChildren(RestrictionRuleComponent)
    ruleComponents: QueryList<RestrictionRuleComponent>;

    ngOnInit() {
        this._editing = -1;
    }

    onModelChanged() {
        this.modelChange.emit(this.model);
    }

    createRule() {

        if (this.rules.length > 0 && !(this.rules[0].id))
            return;

        this.discard();

        var newRule = new RestrictionRule();

        newRule.ip_address = "";
        newRule.allowed = false;
        newRule.subnet_mask = "255.255.255.255";
        newRule.ip_restriction = this.model;

        this.rules.unshift(newRule);
        this.originalRules.unshift(newRule);
        this._editing = 0;
        this.disableEditingExcept(-1); // New rule is not yet added to ruleComponents, therefore disable editing for all

    }

    edit(index) {
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
                this.setRule(this._editing, this.originalRules[this._editing]);
                this._editing = -1;
                this.enableEditing();
                return true;
            }
            else {
                this.onDelete(this._editing);
                return false;
            }
        }
        return true;
    }

    onFinishEditing(index) {
        if (this.rules[index] && this.rules[index].id) {
            if (this.rules[index].ip_address != "") {
                this.changeRule.emit(index);
                this._editing = -1;
                this.enableEditing();
            }
            else
                return;
        }
        else {
            if (this.rules[index].ip_address != "") {
                this.addRule.emit(index);
                this._editing = -1;
                this.enableEditing();
            }
            else
                return;
        }
    }

    onDelete(index) {

        if (this.rules[index].id)
            this.deleteRule.emit(this.rules[index]);

        this.rules.splice(index, 1);
        this.originalRules.splice(index, 1);

        if (this._editing == index) {
            this._editing = -1;
            this.enableEditing();
        }
        else if (this._editing > index) {
            this._editing -= 1;
            this.disableEditingExcept(this._editing);
        }
    }
    
    private setRule(index, rule) {
        this.rules[index] = rule;
        this.originalRules[index] = JSON.parse(JSON.stringify(rule));
    }

    private disableEditingExcept(index) {
        let arr = this.ruleComponents.toArray();
        for (var i = 0; i < arr.length; i++) {
            if (i !== index) {
                if (arr[i].model.id) {
                    arr[i].setEditable(false);
                }
            }
        }
    }

    private enableEditing() {
        let arr = this.ruleComponents.toArray();
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].model.id) {
                arr[i].setEditable(true);
            }
        }
    }

}
