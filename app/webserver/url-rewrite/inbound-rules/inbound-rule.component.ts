import { Component, AfterViewInit, OnChanges, OnDestroy, EventEmitter, Input, Output, ViewChildren, QueryList, SimpleChange } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { NotificationService } from '../../../notification/notification.service';
import { Selector } from '../../../common/selector';
import { UrlRewriteService } from '../url-rewrite.service';
import { InboundRule, ActionTypeHelper } from '../url-rewrite';

@Component({
    selector: 'inbound-rule',
    template: `
        <div *ngIf="rule" class="grid-item row" [class.background-selected]="_editing" (dblclick)="edit()">
            <div class="col-xs-8 col-sm-3 valign">
                {{rule.name}}
            </div>
            <div class="visible-lg col-lg-2 valign">
                {{toFriendlyActionType(rule.action.type)}}
            </div>
            <div class="hidden-xs col-sm-3 col-lg-2 valign">
                {{rule.pattern}}
            </div>
            <div class="hidden-xs col-sm-4 valign">
                <span *ngIf="rule.action.type == 'redirect' || rule.action.type == 'rewrite'">{{rule.action.url}}</span>
            </div>
            <div class="actions">
                <div class="action-selector">
                    <button title="More" (click)="selector.toggle()" (dblclick)="$event.preventDefault()" [class.background-active]="(selector && selector.opened) || _editing || false">
                        <i class="fa fa-ellipsis-h"></i>
                    </button>
                    <selector #selector [right]="true">
                        <ul>
                            <li><button #menuButton class="edit" title="Edit" (click)="edit()">Edit</button></li>
                            <li><button #menuButton class="up" title="Up" (click)="_service.moveInboundUp(rule)">Move Up</button></li>
                            <li><button #menuButton class="down" title="Down" (click)="_service.moveInboundDown(rule)">Move Down</button></li>
                            <li><button #menuButton class="copy" title="Copy" (click)="_service.copyInboundRule(rule)">Clone</button></li>
                            <li><button #menuButton class="delete" title="Delete" (click)="delete()">Delete</button></li>
                        </ul>
                    </selector>
                </div>
            </div>
        </div>
        <selector #editSelector [opened]="true" *ngIf="_editing" class="container-fluid">
            <inbound-rule-edit [rule]="rule" (save)="save($event)" (cancel)="discard()"></inbound-rule-edit>
        </selector>
    `
})
export class InboundRuleComponent implements AfterViewInit, OnChanges, OnDestroy {
    @Input() public rule: InboundRule;
    @Output('delete') deleteEvent: EventEmitter<any> = new EventEmitter<any>();

    private _editing: boolean = false;
    //
    // Use ViewChildren to listen for when the edit dialog appears
    @ViewChildren('editSelector') private _editSelector: QueryList<Selector>;
    private _subscriptions: Array<Subscription> = [];
    private toFriendlyActionType: Function = ActionTypeHelper.toFriendlyActionType;
    private _original: InboundRule;

    constructor(private _service: UrlRewriteService, private _notificationService: NotificationService) {
    }

    ngOnChanges(changes: { [key: string]: SimpleChange; }): any {
        if (changes["rule"]) {
            this._original = JSON.parse(JSON.stringify(changes["rule"].currentValue));
        }
    }

    public ngAfterViewInit() {
        this._subscriptions.push(this._editSelector.changes.subscribe(sel => {

            //
            // Setup callback for when edit dialog closes
            this._editSelector.forEach(selector => {
                this._subscriptions.push(selector.hide.subscribe(() => this.discard()));
            });
        }));
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(sub => sub.unsubscribe());
    }

    private edit() {
        this._editing = true;
    }

    private delete() {
        this._notificationService.confirm("Delete Inbound Rule", "Are you sure you want to delete '" + this.rule.name + "'?")
            .then(confirmed => confirmed && this._service.deleteInboundRule(this.rule));
    }

    private save() {
        this._service.saveInboundRule(this.rule)
            .then(() => this._original = JSON.parse(JSON.stringify(this.rule)));
        this._editing = false;
    }

    private discard() {
        this.rule = JSON.parse(JSON.stringify(this._original));
        this._editing = false;
    }
}