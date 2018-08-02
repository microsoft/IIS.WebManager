import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { DiffUtil } from '../../utils/diff';
import { Status } from '../../common/status';
import { StaticContent, ClientCache } from './static-content';
import { StaticContentService } from './static-content.service';
import { NotificationService } from '../../notification/notification.service';

@Component({
    template: `
        <loading *ngIf="_service.status == 'unknown' && !_service.error"></loading>
        <error [error]="_service.error"></error>
        <override-mode class="pull-right" *ngIf="staticContent" [scope]="staticContent.scope" [metadata]="staticContent.metadata" (revert)="onRevert()" (modelChanged)="onModelChanged()"></override-mode>
        <switch class="install" *ngIf="_service.webserverScope && _service.status != 'unknown'" #s
                [auto]="false"
                [model]="_service.status == 'started' || _service.status == 'starting'" 
                [disabled]="_service.status == 'starting' || _service.status == 'stopping'"
                (modelChanged)="install(!s.model)">
                    <span *ngIf="!isPending()">{{s.model ? "On" : "Off"}}</span>
                    <span *ngIf="isPending()" class="loading"></span>
        </switch>
        <span *ngIf="_service.status == 'stopped' && !_service.webserverScope">Static Content is off. Turn it on <a [routerLink]="['/webserver/static-content']">here</a></span>
        <div *ngIf="staticContent">
            <client-cache [model]="staticContent.client_cache" [locked]="_locked" (modelChange)="onModelChanged()"></client-cache>
        </div>
    `
})
export class StaticContentComponent implements OnInit, OnDestroy {
    id: string;
    staticContent: StaticContent;

    private _original: StaticContent;
    private _error: any;
    private _locked: boolean;
    private _subscriptions: Array<Subscription> = [];

    constructor(private _service: StaticContentService,
                private _notificationService: NotificationService) {
    }

    public ngOnInit() {
        this._subscriptions.push(this._service.staticContent.subscribe(feature => this.setFeature(feature)));
        this._service.initialize(this.id);
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(sub => sub.unsubscribe());
    }

    private onModelChanged() {
        var changes = DiffUtil.diff(this._original, this.staticContent);

        if (Object.keys(changes).length == 0) {
            return;
        }

        if (changes.client_cache.control_mode && changes.client_cache.control_mode == 'use_expires') {
            changes.client_cache.http_expires = this.staticContent.client_cache.http_expires;
        }

        this._service.update(changes);
    }

    private onRevert() {
        this._service.revert();
    }

    private setFeature(feature) {
        if (feature) {
            this._locked = feature.metadata.is_locked;
        }

        this.staticContent = feature;
        this._original = JSON.parse(JSON.stringify(feature));
    }

    private isPending(): boolean {
        return this._service.status == Status.Starting
            || this._service.status == Status.Stopping;
    }

    private install(val: boolean) {
        if (val) {
            return this._service.install();
        }
        else {
            this._notificationService.confirm("Turn Off Static Content", 'This will turn off "Static Content" for the entire web server.')
                .then(result => {
                    if (result) {
                        this._service.uninstall();
                    }
                });
        }
    }
}
