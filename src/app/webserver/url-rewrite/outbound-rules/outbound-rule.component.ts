import { Component, OnChanges, EventEmitter, Input, Output, SimpleChange } from '@angular/core';
import { NotificationService } from '../../../notification/notification.service';
import { UrlRewriteService } from '../service/url-rewrite.service';
import { OutboundRule, OutboundMatchTypeHelper } from '../url-rewrite';

@Component({
    selector: 'outbound-rule',
    template: `
        <div *ngIf="rule" class="grid-item row" [class.background-selected]="_editing" (dblclick)="edit()">
            <div class="col-xs-8 col-sm-3 valign">
                <span class="pointer" (click)="edit()">{{rule.name}}</span>
            </div>
            <div class="visible-lg col-lg-2 valign">
                {{toFriendlyMatchType(rule.match_type)}}
            </div>
            <div class="hidden-xs col-sm-3 col-lg-2 valign">
                {{rule.pattern}}
            </div>
            <div class="hidden-xs col-sm-4 valign">
                {{rule.rewrite_value}}
            </div>
            <div class="actions">
                <div class="action-selector">
                    <button title="More" (click)="selector.toggle()" (dblclick)="$event.preventDefault()" [class.background-active]="(selector && selector.opened) || _editing || false">
                        <i aria-hidden="true" class="fa fa-ellipsis-h"></i>
                    </button>
                    <selector #selector [right]="true" [isQuickMenu]="true">
                        <ul>
                            <li><button #menuButton class="edit" title="Edit" (click)="edit()">Edit</button></li>
                            <li><button #menuButton class="copy" title="Copy" (click)="_service.copyOutboundRule(rule)">Clone</button></li>
                            <li><button #menuButton class="up" title="Up" (click)="_service.moveOutboundUp(rule)">Move Up</button></li>
                            <li><button #menuButton class="down" title="Down" (click)="_service.moveOutboundDown(rule)">Move Down</button></li>
                            <li><button #menuButton class="delete" title="Delete" (click)="delete()">Delete</button></li>
                        </ul>
                    </selector>
                </div>
            </div>
        </div>
        <selector #editSelector [opened]="true" *ngIf="_editing" class="container-fluid" (hide)="discard()">
            <outbound-rule-edit [rule]="rule" (save)="save($event)" (cancel)="discard()"></outbound-rule-edit>
        </selector>
    `
})
export class OutboundRuleComponent implements OnChanges {
    @Input() public rule: OutboundRule;
    @Output('delete') deleteEvent: EventEmitter<any> = new EventEmitter<any>();

    private _editing: boolean = false;
    private toFriendlyMatchType: Function = OutboundMatchTypeHelper.display;
    private _original: OutboundRule;

    constructor(private _service: UrlRewriteService, private _notificationService: NotificationService) {
    }

    ngOnChanges(changes: { [key: string]: SimpleChange; }): any {
        if (changes["rule"]) {
            this._original = JSON.parse(JSON.stringify(changes["rule"].currentValue));
        }
    }

    private edit() {
        this._editing = true;
    }

    private delete() {
        this._notificationService.confirm("Delete Outbound Rule", "Are you sure you want to delete '" + this.rule.name + "'?")
            .then(confirmed => confirmed && this._service.deleteOutboundRule(this.rule));
    }

    private save() {
        this._service.saveOutboundRule(this.rule)
            .then(() => this._original = JSON.parse(JSON.stringify(this.rule)));
        this._editing = false;
    }

    private discard() {
        this.rule = JSON.parse(JSON.stringify(this._original));
        this._editing = false;
    }
}