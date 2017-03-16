
import {Component, Input, Output, EventEmitter, ElementRef, OnInit} from '@angular/core';

import {AnonymousAuthentication} from './authentication'

@Component({
    selector: 'anon-auth',
    template: `
        <error [error]="error"></error>

        <div *ngIf="model">
            <override-mode class="pull-right" [metadata]="model.metadata" (revert)="onRevert()" (modelChanged)="onModelChanged()"></override-mode>
            <fieldset>
                <switch class="block" [disabled]="_locked" [(model)]="model.enabled" (modelChanged)="onModelChanged()">{{model.enabled ? "On" : "Off"}}</switch>
            </fieldset>
            <div class="clear" *ngIf="model.enabled">
                <fieldset>
                    <label>User</label>
                    <input class="form-control path" type="text" [disabled]="_locked" [(ngModel)]="model.user" throttle (modelChanged)="onModelChanged()" />
                </fieldset>
                <fieldset>
                    <label>Password</label>
                    <input class="form-control path" type="text" [disabled]="_locked" [(ngModel)]="model.password" throttle (modelChanged)="onModelChanged()" />
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
export class AnonymousAuthenticationComponent implements OnInit {
    @Input() model: AnonymousAuthentication;
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
