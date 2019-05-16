
import {Component, OnInit} from '@angular/core';

import {HttpResponseHeadersService} from './http-response-headers.service';
import {NotificationService} from '../../notification/notification.service';

import {DiffUtil} from '../../utils/diff';
import {HttpResponseHeaders, CustomHeader, RedirectHeader} from './http-response-headers';

@Component({
    template: `
        <loading *ngIf="!(httpResponseHeaders || _error)"></loading>
        <error [error]="_error"></error>
        <div *ngIf="httpResponseHeaders">
            <override-mode class="pull-right" [metadata]="httpResponseHeaders.metadata" (revert)="onRevert()" (modelChanged)="onModelChanged()"></override-mode>
            <fieldset>
                <switch label="Keep Alive" class="block" [disabled]="_locked" [(model)]="httpResponseHeaders.allow_keep_alive" (modelChanged)="onModelChanged()">{{httpResponseHeaders.allow_keep_alive ? "On" : "Off"}}</switch>
            </fieldset>
            <tabs>
                <tab [name]="'Custom Headers'">
                    <custom-headers [model]="httpResponseHeaders" [headers]="customHeaders" [originalHeaders]="originalCustomHeaders"
                                    (add)="addHeader($event, true)" (delete)="deleteHeader($event)" (save)="saveHeaderChanges($event, true)" [locked]="_locked"></custom-headers> 
                </tab>
                <tab [name]="'Redirect Headers'">
                    <redirect-headers [model]="httpResponseHeaders" [headers]="redirectHeaders" [originalHeaders]="originalRedirectHeaders"
                                    (add)="addHeader($event, false)" (delete)="deleteHeader($event)" (save)="saveHeaderChanges($event, false)" [locked]="_locked"></redirect-headers> 
                </tab>
            </tabs>
        </div>
    `,
    styles: [`
        fieldset:first-of-type {
            padding-top: 0;
            margin-bottom: 30px;
        }
    `]
})
export class HttpResponseHeadersComponent implements OnInit {

    id: string;
    httpResponseHeaders: HttpResponseHeaders;

    customHeaders: Array<CustomHeader>;
    originalCustomHeaders: Array<CustomHeader>;
    redirectHeaders: Array<RedirectHeader>;
    originalRedirectHeaders: Array<RedirectHeader>;

    private _original: HttpResponseHeaders;
    private _error: any;
    private _locked: boolean;

    constructor(private _service: HttpResponseHeadersService,
                private _notificationService: NotificationService) {
    }

    ngOnInit() {
        this.initialize();
    }

    onModelChanged() {

        if (this.httpResponseHeaders) {

            var changes = DiffUtil.diff(this._original, this.httpResponseHeaders);

            if (Object.keys(changes).length > 0) {

                this._service.patchFeature(this.httpResponseHeaders, changes)
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
        this._service.revert(this.httpResponseHeaders.id)
            .then(_ => {
                this.initialize();
            })
            .catch(e => {
                this._error = e;
            });
    }

    saveHeaderChanges(index: number, isCustom: boolean) {
        if (isCustom && this.customHeaders && this.customHeaders[index] && this.customHeaders[index].id) {
            var mapChanges = DiffUtil.diff(this.originalCustomHeaders[index], this.customHeaders[index]);
            var header = this.customHeaders[index];
        }
        else if (!isCustom && this.redirectHeaders && this.redirectHeaders[index] && this.redirectHeaders[index].id) {
            var mapChanges = DiffUtil.diff(this.originalRedirectHeaders[index], this.redirectHeaders[index]);
            var header = this.redirectHeaders[index];
        }
        else {
            return;
        }

        if (mapChanges && header && Object.keys(mapChanges).length > 0) {
            this._service.patchHeader(header, mapChanges)
                .then(map => {
                    this.setHeader(index, map, isCustom);
                });
        }
        else {
            this._notificationService.clearWarnings();
        }
    }


    deleteHeader(header: any) {
        this._service.deleteHeader(header);
    }

    addHeader(index: number, isCustom: boolean) {
        if (isCustom) {
            this._service.addCustomHeader(this.httpResponseHeaders, this.customHeaders[index])
                .then(header => {
                    this.setHeader(index, header, isCustom);
                })
                .catch(e => {
                    this.initialize();
                });
        }
        else {
            this._service.addRedirectHeader(this.httpResponseHeaders, this.redirectHeaders[index])
                .then(header => {
                    this.setHeader(index, header, isCustom);
                })
                .catch(e => {
                    this.initialize();
                });
        }  
    }

    private initialize() {
        this._service.get(this.id)
            .then(s => {
                this.setFeature(s.feature);
                this.customHeaders = s.customHeaders;
                this.originalCustomHeaders = JSON.parse(JSON.stringify(s.customHeaders));
                this.redirectHeaders = s.redirectHeaders;
                this.originalRedirectHeaders = JSON.parse(JSON.stringify(s.redirectHeaders));
            })
            .catch(e => {
                this._error = e;
            });
    }

    private setFeature(feature) {
        this.httpResponseHeaders = feature;
        this._original = JSON.parse(JSON.stringify(feature));

        this._locked = this.httpResponseHeaders.metadata.is_locked ? true : null;
    }

    private setHeader(index: number, header: any, isCustom: boolean) {
        if (isCustom) {
            this.customHeaders[index] = header;
            this.originalCustomHeaders[index] = JSON.parse(JSON.stringify(header));
        }
        else {
            this.redirectHeaders[index] = header;
            this.originalRedirectHeaders[index] = JSON.parse(JSON.stringify(header));
        }
    }

}
