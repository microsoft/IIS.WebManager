import { Component, Input, Output, EventEmitter } from '@angular/core';

import { UrlRewriteService } from '../url-rewrite.service';
import { Provider, ProviderSetting } from '../url-rewrite';

@Component({
    selector: 'provider-edit',
    template: `
        <div *ngIf="provider">
            <fieldset>
                <label>Name</label>
                <input type="text" class="form-control name" [(ngModel)]="provider.name" />
            </fieldset>
            <fieldset>
                <label>Type</label>
                <input type="text" class="form-control name" [(ngModel)]="provider.type" />
            </fieldset>

            <button (click)="add()" class="create"><span>Add</span></button>
            <div class="container-fluid">
                <div class="row hidden-xs border-active grid-list-header">
                    <label class="col-xs-6 col-sm-4">Name</label>
                    <label class="col-xs-6 col-sm-4">Value</label>
                </div>
            </div>

            <ul class="grid-list container-fluid">
                <li *ngIf="_newSetting">
                    <provider-setting-edit [setting]="_newSetting" (save)="saveNew($event)" (cancel)="discardNew()"></provider-setting-edit>
                </li>
                <li *ngFor="let setting of provider.settings">
                    <provider-setting [setting]="setting" (delete)="onDelete(i)"></provider-setting>
                </li>
            </ul>

            <p class="pull-right">
                <button [disabled]="!isValid()" (click)="onOk()" class="ok">OK</button>
                <button (click)="onDiscard()" class="cancel">Cancel</button>
            </p>
        </div>
    `,
    styles: [`
        p {
            margin: 20px 0;
        }

        .create {
            margin-top: 30px;
        }
    `]
})
export class ProviderEditComponent {
    @Input() public provider: Provider;

    @Output() cancel: EventEmitter<any> = new EventEmitter<any>();
    @Output() save: EventEmitter<any> = new EventEmitter<any>();

    private _newSetting: ProviderSetting;

    constructor(private _svc: UrlRewriteService) {
    }

    private isValid(): boolean {
        return !!this.provider.name &&
            !!this.provider.type &&
            !this.provider.settings.find(setting => !setting.name || !setting.value);
    }

    private add() {
        let setting = new ProviderSetting();
        let name = "New Setting";
        setting.name = name;

        let i = 1;
        while (this.provider.settings.find(s => s.name.toLocaleLowerCase() == setting.name.toLocaleLowerCase())) {
            setting.name = name + " " + (i++);
        }

        this._newSetting = setting;
    }

    private onDelete(index: number) {
        this.provider.settings.splice(index, 1);
    }

    private onDiscard() {
        this.cancel.emit();
    }

    private onOk() {
        this.save.emit(this.provider);
    }

    private saveNew(setting: ProviderSetting) {
        this.provider.settings.push(setting);
        this._newSetting = null;
    }

    private discardNew() {
        this._newSetting = null;
    }
}