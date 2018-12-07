import { Component, Input, Output, EventEmitter, OnChanges, SimpleChange } from '@angular/core';

import { UrlRewriteService } from '../service/url-rewrite.service';
import { ProviderSetting } from '../url-rewrite';

@Component({
    selector: 'provider-setting',
    template: `
        <div *ngIf="setting && !_editing" class="grid-item row" [class.background-selected]="_editing" (dblclick)="edit()">
            <div class="col-xs-6 col-sm-4 valign">
                {{setting.name}}
            </div>
            <div class="col-xs-6 col-sm-4 valign">
                {{setting.value}}
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
        <provider-setting-edit
            *ngIf="_editing"
            [setting]="setting"
            (save)="onSave()"
            (cancel)="onCancel()"></provider-setting-edit>
    `
})
export class SettingComponent implements OnChanges {
    @Input() public setting: ProviderSetting;
    @Output('delete') public deleteEvent: EventEmitter<any> = new EventEmitter<any>();

    private _editing: boolean;
    private _original: ProviderSetting;

    ngOnChanges(changes: { [key: string]: SimpleChange; }): any {
        if (changes["setting"]) {
            this._original = JSON.parse(JSON.stringify(changes["setting"].currentValue));
        }
    }

    private edit() {
        this._editing = true;
    }

    private onSave() {
        this._editing = false;
        this._original = JSON.parse(JSON.stringify(this.setting))
    }

    private onCancel() {
        this._editing = false;
        this.setting = JSON.parse(JSON.stringify(this._original));
    }

    private delete() {
        this.deleteEvent.next();
    }
}


@Component({
    selector: 'provider-setting-edit',
    template: `
        <div *ngIf="setting" class="grid-item row background-editing">
            <fieldset class="col-lg-10 col-md-10 col-sm-8 col-xs-6 overflow-visible">
                <fieldset>
                    <label>Name</label>
                    <input autofocus type="text" required class="form-control name" [(ngModel)]="setting.name" />
                </fieldset>
                <fieldset>
                    <label>Value</label>
                    <input type="text" required class="form-control name" [(ngModel)]="setting.value" />
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
    `]
})
export class SettingEditComponent {
    @Input() public setting: ProviderSetting;

    @Output() cancel: EventEmitter<any> = new EventEmitter<any>();
    @Output() save: EventEmitter<any> = new EventEmitter<any>();

    private isValid(): boolean {
        return !!this.setting.name && !!this.setting.value;
    }

    private onDiscard() {
        this.cancel.emit();
    }

    private onOk() {
        this.save.emit(this.setting);
    }
}