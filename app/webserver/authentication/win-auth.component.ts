/// <reference path="../../../node_modules/@angular/core/src/core.d.ts" />

import {Component, Input, Output, EventEmitter, ElementRef, OnInit} from '@angular/core';

import {WindowsAuthentication} from './authentication'

@Component({
    selector: 'win-auth',
    template: `
        <error [error]="error"></error>

        <div *ngIf="model">
            <override-mode class="pull-right" [metadata]="model.metadata" (revert)="onRevert()" (modelChanged)="onModelChanged()"></override-mode>
            <fieldset>
                <switch class="block" [disabled]="_locked" [(model)]="model.enabled" (modelChanged)="onModelChanged()">{{model.enabled ? "On" : "Off"}}</switch>
            </fieldset>
            <div class="clear" *ngIf="model.enabled">
                <fieldset>
                    <label>Use Kernel Mode</label>
                    <switch class="block" [disabled]="_locked" [(model)]="model.use_kernel_mode" (modelChanged)="onModelChanged()">{{model.use_kernel_mode ? "On" : "Off"}}</switch>
                </fieldset>
                <ul>
                    <li *ngFor="let provider of model.providers; let i = index;">
                        <checkbox2 [disabled]="_locked" [(model)]="provider.enabled" (modelChanged)="onModelChanged()">{{provider.name}}</checkbox2>
                    </li>
                </ul>
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
export class WindowsAuthenticationComponent implements OnInit {
    @Input() model: WindowsAuthentication;
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