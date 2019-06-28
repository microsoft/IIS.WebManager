import { Component, OnChanges, EventEmitter, Input, Output, SimpleChange } from '@angular/core';

import { NotificationService } from '../../../notification/notification.service';
import { Selector } from '../../../common/selector';
import { UrlRewriteService } from '../service/url-rewrite.service';
import { Provider } from '../url-rewrite';

@Component({
    selector: 'provider',
    template: `
        <div *ngIf="provider" class="grid-item row" [class.background-selected]="_editing" (dblclick)="edit()">
            <div class="col-xs-8 col-sm-5 valign">
                <span class="pointer" (click)="edit()">{{provider.name}}</span>
            </div>
            <div class="hidden-xs col-sm-5 valign">
                {{provider.type}}
            </div>
            <div class="actions">
                <div class="action-selector">
                    <button title="More" (click)="selector.toggle()" (dblclick)="$event.preventDefault()" [class.background-active]="(selector && selector.opened) || _editing || false">
                        <i aria-hidden="true" class="fa fa-ellipsis-h"></i>
                    </button>
                    <selector aria-hidden="true" #selector [right]="true">
                        <ul>
                            <li><button #menuButton class="edit" title="Edit" (click)="edit()">Edit</button></li>
                            <li><button #menuButton class="delete" title="Delete" (click)="delete()">Delete</button></li>
                            <li><button #menuButton class="copy" title="Copy" (click)="copy()">Clone</button></li>
                        </ul>
                    </selector>
                </div>
            </div>
        </div>
        <selector aria-hidden="true" #editSelector [opened]="true" *ngIf="_editing" class="container-fluid" (hide)="discard()">
           <provider-edit [provider]="provider" (save)="save($event)" (cancel)="discard()"></provider-edit>
        </selector>
    `
})
export class ProviderComponent implements OnChanges {
    @Input() public provider: Provider;
    @Output('delete') deleteEvent: EventEmitter<any> = new EventEmitter<any>();

    private _editing: boolean = false;
    private _original: Provider;

    constructor(private _service: UrlRewriteService, private _notificationService: NotificationService) {
    }

    ngOnChanges(changes: { [key: string]: SimpleChange; }): any {
        if (changes["provider"]) {
            this._original = JSON.parse(JSON.stringify(changes["provider"].currentValue));
        }
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