import {Component, OnInit} from '@angular/core';

import {StaticContentService} from './static-content.service';
import {Logger} from '../../common/logger';
import {NotificationService} from '../../notification/notification.service';

import {DiffUtil} from '../../utils/diff';
import {StaticContent, ClientCache} from './static-content';

@Component({
    template: `
        <loading *ngIf="!(staticContent || _error)"></loading>
        <error [error]="_error"></error>
        <div *ngIf="staticContent">
            <override-mode class="pull-right" [metadata]="staticContent.metadata" (revert)="onRevert()" (modelChanged)="onModelChanged()"></override-mode>
            <client-cache [model]="staticContent.client_cache" [locked]="_locked" (modelChange)="onModelChanged()"></client-cache>
        </div>
    `
})
export class StaticContentComponent implements OnInit {

    id: string;
    staticContent: StaticContent;

    private _original: StaticContent;
    private _error: any;
    private _locked: boolean;

    constructor(private _service: StaticContentService,
                private _notificationService: NotificationService) {
    }

    ngOnInit() {
        this.initialize();
    }

    onModelChanged() {

        if (this.staticContent) {

            var changes = DiffUtil.diff(this._original, this.staticContent);

            if (Object.keys(changes).length > 0) {

                this._service.updateFeature(this.staticContent, changes)
                    .then(feature => {
                        this._notificationService.clearWarnings();
                        this.setFeature(feature);
                    });
            }
            else {
                this._notificationService.clearWarnings();
            }
        }
    }

    onRevert() {
        this._service.revert(this.staticContent.id)
            .then(_ => {
                this.initialize();
            })
            .catch(e => {
                this._error = e;
            });
    }

    private initialize() {
        this._service.get(this.id)
            .then(s => {
                this.setFeature(s.feature);
            })
            .catch(e => {
                this._error = e;
            });
    }

    private setFeature(feature) {
        this.staticContent = feature;
        this._original = JSON.parse(JSON.stringify(feature));

        this._locked = this.staticContent.metadata.is_locked;
    }    
}