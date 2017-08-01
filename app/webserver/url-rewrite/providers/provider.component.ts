import { Component, AfterViewInit, OnChanges, OnDestroy, EventEmitter, Input, Output, ViewChildren, QueryList, SimpleChange } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { NotificationService } from '../../../notification/notification.service';
import { Selector } from '../../../common/selector';
import { UrlRewriteService } from '../url-rewrite.service';
import { Provider } from '../url-rewrite';

@Component({
    selector: 'provider',
    template: `
        <div *ngIf="provider" class="grid-item row" [class.background-selected]="_editing" (dblclick)="edit()">
            <div class="col-sm-3 valign">
                {{provider.name}}
            </div>
            <div class="col-sm-3 valign">
                {{provider.type}}
            </div>
            <div class="actions">
                <div class="action-selector">
                    <button title="More" (click)="selector.toggle()" (dblclick)="$event.preventDefault()" [class.background-active]="(selector && selector.opened) || _editing || false">
                        <i class="fa fa-ellipsis-h"></i>
                    </button>
                    <selector #selector [right]="true">
                        <ul>
                            <li><button #menuButton class="edit" title="Edit" (click)="edit()">Edit</button></li>
                            <li><button #menuButton class="delete" title="Delete" (click)="delete()">Delete</button></li>
                            <li><button #menuButton class="copy" title="Copy" (click)="copy()">Copy</button></li>
                        </ul>
                    </selector>
                </div>
            </div>
        </div>
        <selector #editSelector [opened]="true" *ngIf="_editing" class="container-fluid">
           <provider-edit [provider]="provider" (save)="save($event)" (cancel)="discard()"></provider-edit>
        </selector>
    `
})
export class ProviderComponent implements AfterViewInit, OnChanges, OnDestroy {
    @Input() public provider: Provider;
    @Output('delete') deleteEvent: EventEmitter<any> = new EventEmitter<any>();

    private _editing: boolean = false;
    //
    // Use ViewChildren to listen for when the edit dialog appears
    @ViewChildren('editSelector') private _editSelector: QueryList<Selector>;
    private _subscriptions: Array<Subscription> = [];
    private _original: Provider;

    constructor(private _service: UrlRewriteService, private _notificationService: NotificationService) {
    }

    ngOnChanges(changes: { [key: string]: SimpleChange; }): any {
        if (changes["provider"]) {
            this._original = JSON.parse(JSON.stringify(changes["provider"].currentValue));
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
        this._notificationService.confirm("Delete Provider", "Are you sure you want to delete '" + this.provider.name + "'?")
            .then(confirmed => confirmed && this._service.deleteProvider(this.provider));
    }

    private save() {
        this._service.saveProvider(this.provider)
            .then(() => this._original = JSON.parse(JSON.stringify(this.provider)));
        this._editing = false;
    }

    private discard() {
        this.provider = JSON.parse(JSON.stringify(this._original));
        this._editing = false;
    }

    private copy() {
        this._service.copyProvider(this.provider);
    }
}