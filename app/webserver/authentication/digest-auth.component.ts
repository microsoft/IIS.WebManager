/// <reference path="../../../node_modules/@angular/core/src/core.d.ts" />

import {Component, Input, Output, EventEmitter, ElementRef, OnInit} from '@angular/core';

import {DigestAuthentication} from './authentication'

@Component({
    selector: 'digest-auth',
    template: `
        <error [error]="error"></error>

        <div *ngIf="model">
            <override-mode class="pull-right" [metadata]="model.metadata" (revert)="onRevert()" (modelChanged)="onModelChanged()"></override-mode>
            <fieldset>
                <switch class="block" [disabled]="_locked" [(model)]="model.enabled" (modelChanged)="onModelChanged()">{{model.enabled ? "On" : "Off"}}</switch>
            </fieldset>
            <fieldset class="clear" *ngIf="model.enabled">
                <label>Realm</label>
                <input class="form-control path" type="text" [disabled]="_locked" [(ngModel)]="model.realm" throttle (modelChanged)="onModelChanged()" />
            </fieldset>
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
export class DigestAuthenticationComponent implements OnInit {
    @Input() model: DigestAuthentication;
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