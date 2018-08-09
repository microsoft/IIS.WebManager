import { Component, OnInit, OnDestroy} from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { DiffUtil } from '../../utils/diff';
import { StaticContentService } from '../static-content/static-content.service';
import { StaticContent, MimeMap } from '../static-content/static-content';

@Component({
    template: `
        <loading *ngIf="service.status == 'unknown' && !service.error"></loading>
        <error [error]="service.error"></error>
        <span *ngIf="service.status == 'stopped'">Mime Maps are off. Turn them on <a [routerLink]="['/webserver/static-content']">here</a></span>
        <override-mode class="pull-right" *ngIf="staticContent" [scope]="staticContent.scope" [metadata]="staticContent.metadata" (revert)="onRevert()" (modelChanged)="onModelChanged()"></override-mode>
        <div *ngIf="staticContent">
            <mime-maps (modelChanged)="onSave($event)" (delete)="onDelete($event)" (add)="onAdd($event)"><mime-maps>
        <div>
    `
})
export class MimeMapsComponent implements OnInit, OnDestroy {
    id: string;
    staticContent: StaticContent;

    private _original: StaticContent;
    private _error: any;
    private _locked: boolean;
    private _subscriptions: Array<Subscription> = [];

    constructor(private _service: StaticContentService) {
    }

    public ngOnInit() {
        this._subscriptions.push(this._service.staticContent.subscribe(feature => this.setFeature(feature)));
        this._service.initialize(this.id);
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(sub => sub.unsubscribe());
    }

    get service() {
        return this._service;
    }

    private onModelChanged() {
        let changes = DiffUtil.diff(this._original, this.staticContent);

        if (Object.keys(changes).length == 0) {
            return;
        }

        this._service.update(changes);
    }

    private onRevert() {
        this._service.revert();
    }

    private setFeature(feature) {
        if (feature) {
            this._locked = feature.is_locked;
        }

        this.staticContent = feature;
        this._original = JSON.parse(JSON.stringify(feature));
    }
}
