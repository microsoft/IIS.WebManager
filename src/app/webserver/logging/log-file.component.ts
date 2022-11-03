import { Component, Input, Inject, ViewChild } from '@angular/core';
import { Selector } from 'common/selector';
import { Humanizer } from 'common/primitives';
import { HttpClient } from 'common/http-client';
import { ApiFile } from 'files/file';
import { LoggingService } from './logging.service';
import { FilesService } from 'files/files.service';
import { Runtime } from 'runtime/runtime';

@Component({
    selector: 'log-file',
    template: `
        <div *ngIf="model" class="grid-item row" tabindex="-1">
            <div class="col-xs-9 col-sm-5 col-lg-4 valign" [ngClass]="[model.type, model.extension]">
                    <a class="color-normal hover-color-active" [href]="url" (click)="onClickName($event)"><i></i>{{model.name}}</a>
            </div>
            <div class="col-sm-3 col-md-2 hidden-xs valign support">
                <span *ngIf="model.last_modified">{{displayDate}}</span>
            </div>
            <div class="col-md-2 visible-lg visible-md valign support">
                {{this.model.description}}
            </div>
            <div class="col-md-1 visible-lg visible-md valign text-right support">
                <span *ngIf="model.size">{{getSize()}}</span>
            </div>
            <div class="actions">
                <div class="action-selector">
                    <button title="More" (click)="selector.toggle()" (dblclick)="prevent($event)" [class.background-active]="selector && selector.opened">
                        <i aria-hidden="true" class="sme-icon sme-icon-more"></i>
                    </button>
                    <selector #selector [right]="true" [isQuickMenu]="true">
                        <ul>
                            <li><button title="Download" class="download" *ngIf="model.type=='file'" (click)="onDownload($event)">Download</button></li>
                            <li><button title="Delete" class="delete" (click)="onDelete($event)">Delete</button></li>
                        </ul>
                    </selector>
                </div>
            </div>
        </div>
    `,
    styles: [`
        a {
            display: inline;
            background: transparent;
        }

        [class*="col-"] {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .form-control {
            width: 90%;
        }

        .row {
            margin: 0px;
        }
`
    ],
    styleUrls: [
        '../../files/file-icons.css'
    ]
})
export class LogFileComponent {
    @Input() model: ApiFile;
    @ViewChild(Selector) selector: Selector;

    constructor(
        private _svc: LoggingService,
        private _http: HttpClient,
        @Inject("FilesService") private _fileService: FilesService,
        @Inject("Runtime") private runtime: Runtime,
    ) {
    }

    private get url() {
        return window.location.pathname + "#" + this.model.name;
    }

    private get displayDate(): string {
        return Humanizer.date(this.model.last_modified);
    }

    private onDownload(e: Event) {
        e.preventDefault();
        this.selector.close();

        this.runtime.Download(this.model);
    }

    private onClickName(e: Event) {
        e.preventDefault();
    }

    private onDelete() {
        this._svc.delete([this.model]);
    }

    private getSize() {
        return this.model.size ? Humanizer.number(Math.ceil(this.model.size / 1024)) + ' KB' : null;
    }
    
    prevent(e: Event) {
        e.preventDefault();
    }
}
