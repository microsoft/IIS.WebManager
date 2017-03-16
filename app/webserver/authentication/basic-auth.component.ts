
import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';

import {BasicAuthentication} from './authentication'

@Component({
    selector: 'basic-auth',
    template: `
        <error [error]="error"></error>
        <div *ngIf="model">
            <override-mode class="pull-right" [metadata]="model.metadata" (revert)="onRevert()" (modelChanged)="onModelChanged()"></override-mode>
            <fieldset>
                <switch class="block" [disabled]="_locked" [(model)]="model.enabled" (modelChanged)="onModelChanged()">{{model.enabled ? "On" : "Off"}}</switch>
            </fieldset>
            <div class="clear" *ngIf="model.enabled">
                <fieldset>
                    <label>Default Logon Domain</label>
                    <input class="form-control path" type="text" [disabled]="_locked" [(ngModel)]="model.default_logon_domain" throttle (modelChanged)="onModelChanged()" />
                </fieldset>
                <fieldset>
                    <label>Realm</label>
                    <input class="form-control path" type="text" [disabled]="_locked" [(ngModel)]="model.realm" throttle (modelChanged)="onModelChanged()" />
                </fieldset>
            </div>
        </div>
    `,
    styles: [`
        h2:first-of-type {
            margin-top: 0;
        }
        .clear {
            clear: both;
        }
    `]
})
export class BasicAuthenticationComponent implements OnInit {
    @Input() model: BasicAuthentication;
    @Input() error: any;
    @Output() modelChange: any = new EventEmitter();
    @Output() revert: any = new EventEmitter();

    private _locked: boolean;

    ngOnInit() {
        if (this.model) {
            this._locked = this.model.metadata.is_locked ? true : null;
        }
    }

    onModelChanged() {
        this.modelChange.emit(this.model);
    }

    onRevert() {
        this.revert.emit(null);
    }
}
