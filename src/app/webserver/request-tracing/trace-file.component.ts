import { Component, Input, Inject, ViewChild } from '@angular/core';
import { Selector } from 'common/selector';
import { Humanizer } from 'common/primitives';
import { HttpClient } from 'common/http-client';
import { TraceLog } from './request-tracing';
import { RequestTracingService } from './request-tracing.service';
import { FilesService } from 'files/files.service';
import { Runtime } from 'runtime/runtime';

@Component({
    selector: 'trace-file',
    template: `
        <div *ngIf="model" class="grid-item row" tabindex="-1">
            <div class="col-xs-8 col-sm-3 col-lg-2 valign" [ngClass]="[model.file_info.type, model.file_info.extension]">
                <a class="color-normal hover-color-active" [href]="url" (click)="onClickName($event)"><i></i>{{model.file_info.name}}</a>
            </div>
            <div class="col-sm-4 col-lg-3 hidden-xs valign support">
                <span *ngIf="model.url">{{model.url}}</span>
            </div>
            <div class="col-md-1 visible-lg valign text-right support">
                <span *ngIf="model.method">{{model.method}}</span>
            </div>
            <div class="col-md-1 visible-lg visible-md valign text-right support">
                {{model.status_code}}
            </div>
            <div class="col-md-1 visible-lg visible-md valign text-right support">
                <span *ngIf="model.time_taken === 0 || model.time_taken">{{model.time_taken}} ms</span>
            </div>
            <div class="col-sm-3 col-md-2 hidden-xs valign support">
                {{displayDate}}
            </div>
            <div class="actions">
                <div class="action-selector">
                    <button title="More" (click)="selector.toggle()" (dblclick)="prevent($event)" (keyup.enter)="prevent($event)" [class.background-active]="(selector && selector.opened) || false">
                        <i aria-hidden="true" class="sme-icon sme-icon-more"></i>
                    </button>
                    <selector #selector [right]="true" [isQuickMenu]="true">
                        <ul>
                            <li><button title="Download" class="download" *ngIf="model.file_info.type=='file'" (click)="onDownload($event)">Download</button></li>
                            <li><button class="delete" *ngIf="model && model.file_info.name.endsWith('.xml')" (click)="onDelete($event)">Delete</button></li>
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
export class TraceFileComponent {
    @Input() model: TraceLog;
    @ViewChild(Selector) selector: Selector;

    constructor(
        private _svc: RequestTracingService,
        private _http: HttpClient,
        @Inject("FilesService") private _fileService: FilesService,
        @Inject("Runtime") private runtime: Runtime,
    ) {
    }

    private get url() {
        return window.location.pathname + "#" + this.model.file_info.name;
    }

    private get displayDate(): string {
        return Humanizer.date(this.model.date);
    }

    private onDownload(e: Event) {
        e.preventDefault();
        this.selector.close();
        this.runtime.Download(this.model && this.model.file_info);
    }

    onClickName(e: Event) {
        e.preventDefault();
        this.runtime.RenderFrebLogs(this.model.file_info);
    }

    private onDelete() {
        this._svc.delete([this.model]);
    }
    
    prevent(e: Event) {
        e.preventDefault();
    }
}
