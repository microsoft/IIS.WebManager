import {Component, Input, Output, OnInit, EventEmitter, ViewChildren, ViewChild, QueryList, OnChanges, SimpleChange, ElementRef} from '@angular/core';

import {FilteringRule} from './request-filtering';

import {DiffUtil} from '../../utils/diff';
import {ComponentUtil} from '../../utils/component';
import {StringListComponent} from '../../common/string-list.component';

@Component({
    selector: 'rule',
    template: `
        <div *ngIf="rule" class="grid-item row" [class.background-editing]="_editing">

            <div class="actions">
                <button class="no-border no-editing" [class.inactive]="!_editable" title="Edit" (click)="onEdit()">
                    <i class="fa fa-pencil color-active"></i>
                </button>
                <button class="no-border editing" [disabled]="!isValidRule(rule) || locked" title="Ok" (click)="finishChanges()">
                    <i class="fa fa-check color-active"></i>
                </button>
                <button class="no-border editing" title="Cancel" (click)="discardChanges()">
                    <i class="fa fa-times red"></i>
                </button>
                <button class="no-border" *ngIf="rule.id" [disabled]="locked" title="Delete" [class.inactive]="!_editable" (click)="onDelete()">
                    <i class="fa fa-trash-o red"></i>
                </button>
            </div>

            <fieldset class="col-xs-8 col-sm-3" *ngIf="!_editing">
                <label class="visible-xs">Name</label>
                <span>{{rule.name}}</span>
                <div>
                    <br class="visible-xs" />
                </div>
            </fieldset>

            <fieldset class="col-xs-8 col-md-9 col-lg-10" *ngIf="_editing">
                <label class="block">Name</label>
                <input class="form-control" type="text" [disabled]="locked" [(ngModel)]="rule.name" throttle required />
            </fieldset>

            <fieldset class="col-xs-8 col-sm-5 col-md-6" *ngIf="!_editing">
                <label class="visible-xs">Denied Values</label>
                <span>{{rule.deny_strings.join(', ')}}</span>
            </fieldset>
    
            <div *ngIf="_editing" class="col-xs-12">
                <div class="row">
                    <div class="col-lg-4 col-md-5 col-xs-12">

                        <fieldset>
                            <label>Scan Url</label>
                            <switch class="block" [disabled]="locked" [(model)]="rule.scan_url">{{rule.scan_url ? "Yes" : "No"}}</switch>
                        </fieldset>
                        <fieldset>
                            <label>Scan Query String</label>
                            <switch class="block" [disabled]="locked" [(model)]="rule.scan_query_string">{{rule.scan_query_string ? "Yes" : "No"}}</switch>
                        </fieldset>

                        <fieldset [class.has-list]="_displayHeaders">
                            <label class="block">Scan Headers</label>
                            <div>
                                <switch [disabled]="locked" [(model)]="_displayHeaders">{{_displayHeaders ? "Yes" : "No"}}</switch>
                                <button class="background-normal pull-right" *ngIf="_displayHeaders" (click)="addHeader()"><i class="fa fa-plus color-active"></i><span>Add</span></button>
                            </div>
                        </fieldset>
                        <fieldset *ngIf="_displayHeaders">
                            <string-list #headers="stringList" [(model)]="rule.headers"></string-list>
                        </fieldset>

                        <fieldset [class.has-list]="_displayFileExtensions">
                            <label class="block">Filter by File Extension</label>
                            <div>
                                <switch [disabled]="locked" [(model)]="_displayFileExtensions">{{_displayFileExtensions ? "Yes" : "No"}}</switch>
                                <button class="background-normal pull-right" *ngIf="_displayFileExtensions" (click)="addFileExtension()"><i class="fa fa-plus color-active"></i><span>Add</span></button>
                            </div>
                        </fieldset>
                        <fieldset *ngIf="_displayFileExtensions">
                            <string-list #fileExtensions="stringList" [(model)]="rule.file_extensions"></string-list>
                        </fieldset>

                    </div>
                    <div class="col-lg-6 col-md-7 col-xs-12">
                        <fieldset class="inline-block has-list">
                            <label class="block">Denied Values</label>
                        </fieldset>
                        <button class="background-normal pull-right" *ngIf="denyStringsVisible()" (click)="addDenyString()"><i class="fa fa-plus color-active"></i><span>Add</span></button>
                        <fieldset>
                            <string-list #ds="stringList" [(model)]="rule.deny_strings"></string-list>
                            <button class="add background-normal" *ngIf="ds.list.length == 0" (click)="addDenyString()"><i class="fa fa-plus color-active"></i><span>Add</span></button>
                        </fieldset>
                    </div>
                </div>

            </div>
        </div>
    `,
    styles: [`
        fieldset.has-list {
            padding-bottom: 0;
        }
        
        div.inline-block {
            float: right;
        }

        [class*="col-"] {
            white-space: nowrap;
        }
        
        .grid-item:not(.background-editing) fieldset {
            padding-top: 5px;
            padding-bottom: 0;
        }
    `],
})
export class RuleComponent implements OnInit, OnChanges {
    @Input() rule: FilteringRule;
    @Input() locked: boolean;

    @Output() edit: EventEmitter<any> = new EventEmitter();
    @Output() delete: EventEmitter<any> = new EventEmitter();
    @Output() modelChanged: EventEmitter<any> = new EventEmitter();
    @Output() discard: EventEmitter<any> = new EventEmitter();

    @ViewChild('headers') headers: StringListComponent;
    @ViewChild('fileExtensions') fileExtensions: StringListComponent;
    @ViewChild('ds') denyStrings: StringListComponent;

    private _displayHeaders: boolean;
    private _displayFileExtensions: boolean;
    private _original;
    private _editing;
    private _editable = true;


    constructor(private _eRef: ElementRef) {
    }

    ngOnInit() {
        this._original = JSON.parse(JSON.stringify(this.rule));

        if (this.rule) {
            this._displayHeaders = this.rule.headers.length > 0;
            this._displayFileExtensions = this.rule.file_extensions.length > 0;

            if (!this.rule.name) {
                this._editing = true;
                this.scheduleScroll();
            }
        }
    }

    ngOnChanges(changes: { [key: string]: SimpleChange; }): any {

        if (changes["rule"]) {
            this._original = JSON.parse(JSON.stringify(changes["rule"].currentValue));
        }
    }


    onEdit() {
        this.edit.emit(null);
        this._editing = true;
        this.scheduleScroll();
    }

    onDelete() {
        if (confirm("Are you sure you want to delete this rule?\nName: " + this.rule.name)) {
            this.delete.emit(null);
        }
    }

    finishChanges() {

        if (!this.isValidRule(this.rule)) {
            return;
        }
        
        if (!this._displayHeaders) {
            this.rule.headers.splice(0);
        }

        if (!this._displayFileExtensions) {
            this.rule.file_extensions.splice(0);
        }

        this._original = JSON.parse(JSON.stringify(this.rule));
        this.modelChanged.emit(null);
        this._editing = false;
    }

    discardChanges() {
        if (this._editing) {

            let keys = Object.keys(this._original);
            for (var key of keys) {
                this.rule[key] = JSON.parse(JSON.stringify(this._original[key]));
            }
            
            this._editing = false;
            this.discard.emit(null);
        }
    }

    setEditable(val: boolean) {
        this._editable = val;
    }

    addHeader() {
        this.headers.add();
    }

    addFileExtension() {
        this.fileExtensions.add();
    }

    addDenyString() {
        this.denyStrings.add();
    }

    removeHeader(index: number) {
        this.rule.headers.splice(index, 1);
    }

    removeFileExtension(index: number) {
        this.rule.file_extensions.splice(index, 1);
    }

    removeDenyString(index: number) {
        this.rule.deny_strings.splice(index, 1);
    }

    isValidRule(rule): boolean {
        return !!rule.name;
    }

    scheduleScroll() {
        setTimeout(() => {
            ComponentUtil.scrollTo(this._eRef);
        });
    }

    private denyStringsVisible() {
        if (!this.denyStrings) {
            return this.rule.deny_strings.length > 0;
        }

        return this.denyStrings.list.length > 0;
    }
}

@Component({
    selector: 'rules',
    template: `
        <div *ngIf="rules">
            <button class="create" (click)="onAdd()" [disabled]="locked" [class.inactive]="_inRule"><i class="fa fa-plus color-active"></i><span>Add</span></button>

            <div class="container-fluid" [hidden]="!rules || rules.length < 1">
                <div class="row hidden-xs border-active grid-list-header">
                    <label class="col-sm-3">Name</label>
                    <label class="col-sm-5 col-md-6">Denied Values</label>
                </div>
            </div>

            <div class="grid-list container-fluid">
                <rule *ngFor="let r of rules; let i = index;" [rule]="r" [locked]="locked" (modelChanged)="onSave(i)" (edit)="onEdit(i)" (discard)="onDiscard(i)" (delete)="onDelete(i)"></rule>
            </div>
        </div>  
    `,
})
export class RulesComponent {
    @Input() rules: Array<FilteringRule>;
    @Input() locked: boolean;

    @Output() delete: EventEmitter<any> = new EventEmitter();
    @Output() save: EventEmitter<any> = new EventEmitter();
    @Output() add: EventEmitter<any> = new EventEmitter();
    @Output() discard: EventEmitter<any> = new EventEmitter();
    
    @ViewChildren(RuleComponent) ruleComponents: QueryList<RuleComponent>;

    private _inRule: boolean;

    onSave(index: number) {
        let rule = this.rules[index];

        if (rule.id) {
            this.save.emit(index);
        }
        else {
            this.add.emit(index);
        }
        this.leaveRule();
    }

    onAdd() {
        for (var rule of this.rules) {
            if (!rule.id) {

                // There is already an uninitialized rule
                return;
            }
        }

        let newRule = new FilteringRule();
        newRule.name = '';
        newRule.headers = [];
        newRule.file_extensions = [];
        newRule.deny_strings = [];
        this.rules.unshift(newRule);

        this.enterRule(-1);
    }

    onEdit(index: number) {
        this.enterRule(index);
    }

    onDiscard(index: number) {
        this.discard.emit(index);
        this.leaveRule();

        if (!this.rules[index].id) {
            this.rules.splice(index, 1);
        }
    }

    onDelete(index: number) {
        this.delete.emit(index);
    }

    private enterRule(index: number) {
        let arr = this.ruleComponents.toArray();
        let uninitialized = -1;

        for (var i = 0; i < arr.length; i ++) {
            if (i !== index) {
                if (arr[i].rule.id) {
                    arr[i].discardChanges();
                    arr[i].setEditable(false);
                }
                else{
                    uninitialized = i;
                }
            }
        }

        if (uninitialized > -1) {
            this.rules.splice(uninitialized, 1);
        }

        this._inRule = true;
    }

    private leaveRule() {
        let arr = this.ruleComponents.toArray();
        for (var rule of arr) {
            rule.setEditable(true);
        }

        this._inRule = false;
    }
}