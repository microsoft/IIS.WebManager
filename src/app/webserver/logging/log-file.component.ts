import { Component, Input, Inject, ViewChild } from '@angular/core';
import { Selector } from 'common/selector';
import { Humanizer } from 'common/primitives';
import { HttpClient } from 'common/http-client';
import { ApiFile } from 'files/file';
import { LoggingService } from './logging.service';
import { FilesService } from 'files/files.service';

@Component({
    selector: 'log-file',
    template: `
        <div *ngIf="model" class="grid-item row" tabindex="-1">
            <div class="col-xs-9 col-sm-5 col-lg-4 valign" [ngClass]="[model.type, model.extension]">
                <a class="color-normal hover-color-active"><i></i>{{model.name}}</a>
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
                <div class="selector-wrapper">
                    <button title="More" (click)="selector.toggle()" (dblclick)="prevent($event)" [class.background-active]="selector && selector.opened">
                        <i class="fa fa-ellipsis-h"></i>
                    </button>
                    <selector #selector [right]="true">
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

        .selector-wrapper {
            position: relative;
        }

        selector {
            position:absolute;
            right:0;
            top: 32px;
        }

        selector button {
            min-width: 125px;
            width: 100%;
        }`
    ],
    styleUrls: [
        '../../files/file-icons.css'
    ]
})
export class LogFileComponent {
    @Input() model: ApiFile;
    @ViewChild(Selector) selector: Selector;

    constructor(private _svc: LoggingService,
              @Inject("FilesService") private _fileService: FilesService,
              private _http: HttpClient) {
    }

    get displayDate(): string {
        return Humanizer.date(this.model.last_modified);
    }

    onDownload(e: Event) {
        e.preventDefault();
        this.selector.close();

        this._fileService.download(this.model);
    }

    onDelete() {
        this._svc.delete([this.model]);
    }

    getSize() {
        return this.model.size ? Humanizer.number(Math.ceil(this.model.size / 1024)) + ' KB' : null;
    }
}
