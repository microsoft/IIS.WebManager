import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { DiffUtil } from '../../utils/diff';
import { Status } from '../../common/status';
import { DefaultDocument, File } from './default-documents';
import { DefaultDocumentsService } from './default-documents.service';
import { NotificationService } from '../../notification/notification.service';

@Component({
    template: `
        <loading *ngIf="service.status == 'unknown' && !service.error"></loading>
        <override-mode class="pull-right" 
            *ngIf="_defDoc" 
            [metadata]="_defDoc.metadata"
            [scope]="_defDoc.scope"
            (revert)="onRevert()" 
            (modelChanged)="onModelChanged()"></override-mode>
        <switch class="install" *ngIf="service.webserverScope && service.status != 'unknown'" #s
                [auto]="false"
                [model]="service.status == 'started' || service.status == 'starting'"
                [disabled]="service.status == 'starting' || service.status == 'stopping'"
                (modelChanged)="install(!s.model)">
                    <span *ngIf="!isPending()">{{s.model ? "On" : "Off"}}</span>
                    <span *ngIf="isPending()" class="loading"></span>
        </switch>
        <span *ngIf="service.status == 'stopped' && !service.webserverScope">Default Documents are off. Turn them on <a [routerLink]="['/webserver/default-documents']">here</a></span>
        <div *ngIf="_defDoc" [attr.disabled]="_defDoc.metadata.is_locked ? true : null">
            <fieldset>
                <label *ngIf="!_defDoc.scope">Web Site Default</label>
                <switch class="block" [(model)]="_defDoc.enabled" (modelChanged)="onModelChanged()">{{_defDoc.enabled ? "On" : "Off"}}</switch>
            </fieldset>
            <files *ngIf="_defDoc.enabled || !_defDoc.scope"></files>
        </div>
    `,
    styles: [`
        files {
            display: block;
            margin-top: 23px;
        }
    `]
})
export class DefaultDocumentsComponent implements OnInit, OnDestroy {
    id: string;
    private _defDoc: DefaultDocument;
    private _original: DefaultDocument;
    private _subscriptions: Array<Subscription> = [];

    constructor(private _service: DefaultDocumentsService,
                private _notificationService: NotificationService) {
    }

    ngOnInit() {
        this.reset();
        this._subscriptions.push(this._service.defaultDocument.subscribe(doc => {
            this.setFeature(doc);
        }));
    }

    get service() {
        return this._service;
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(sub => sub.unsubscribe());
    }

    onModelChanged() {
        if (this._defDoc) {
            var changes = DiffUtil.diff(this._original, this._defDoc);
            
            if (Object.keys(changes).length > 0) {
                this._service.update(changes)
                    .then(feature => {
                        this.setFeature(feature)
                    });
            }
        }
    }

    private setFeature(defDoc: DefaultDocument) {
        this._defDoc = defDoc;
        this._original = JSON.parse(JSON.stringify(defDoc));
    }

    private onRevert() {
        this._service.revert().then(d => this.setFeature(d));
    }

    private isPending(): boolean {
        return this._service.status == Status.Starting
            || this._service.status == Status.Stopping;
    }

    private reset() {
        this.setFeature(null);
        this._service.init(this.id);
    }

    private install(val: boolean) {
        if (val) {
            return this._service.install();
        }
        else {
            this._notificationService.confirm("Turn Off Default Documents", 'This will turn off "Default Documents" for the entire web server.')
                .then(confirmed => {
                    if (confirmed) {
                        this._service.uninstall();
                    }
                });
        }
    }
}
