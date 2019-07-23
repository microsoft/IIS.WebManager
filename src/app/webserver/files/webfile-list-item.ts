import { Component, Input, Output, Inject, ViewChild, EventEmitter } from '@angular/core';
import { Selector } from 'common/selector';
import { NotificationService } from 'notification/notification.service';
import { Humanizer } from 'common/primitives';
import { FilesService } from 'files/files.service';
import { WebFilesService } from './webfiles.service';
import { WebFileType, WebFile } from './webfile';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'file',
    template: `
        <div *ngIf="model" class="grid-item row" [class.background-editing]="_editing" (keyup.f2)="onRename($event)" tabindex="-1">
            <div class="col-xs-9 col-sm-5 col-lg-4 fi" [ngClass]="[model.type, !model.file_info ? '' : model.file_info.extension]">
                <div *ngIf="!_editing">
                    <a tabIndex="0"
                        class="color-normal hover-color-active"
                        (click)="browse($event)"
                        nofocus><i></i>{{model.name}}</a>
                </div>
                <div *ngIf="_editing">
                    <i></i>
                    <input class="form-control inline-block" type="text" 
                           [ngModel]="model.name"
                           (ngModelChange)="rename($event)"
                           (blur)="onBlur($event)"
                           (keyup.enter)="_editing=false"
                           (keyup.esc)="onCancel($event)"
                           (keyup.delete)="$event.stopImmediatePropagation()"
                           (dblclick)="prevent($event)"
                           required throttle autofocus/>
                </div>
            </div>
            <div class="col-sm-3 col-md-2 hidden-xs valign support">
                <span *ngIf="model.file_info && model.file_info.last_modified">{{displayDate}}</span>
            </div>
            <div class="col-md-2 visible-lg visible-md valign support">
                {{this.model.description}}
            </div>
            <div class="col-md-1 visible-lg visible-md valign text-right support">
                <span *ngIf="model.file_info && model.file_info.size">{{getSize()}}</span>
            </div>
            <div class="actions">
                <div class="selector-wrapper">
                    <button title="More" *ngIf="!model.isVirtual" (click)="openSelector($event)" (keyup.enter)="prevent($event)" (dblclick)="prevent($event)" [class.background-active]="(selector && selector.opened) || false">
                        <i aria-hidden="true" class="fa fa-ellipsis-h"></i>
                    </button>
                    <selector [right]="true">
                        <ul>
                            <li><button class="edit" title="Rename" *ngIf="model.type!='vdir' && model.file_info" (click)="onRename($event)">Rename</button></li>
                            <li><button class="download" title="Download" *ngIf="model.type=='file' && model.file_info" (click)="onDownload($event)">Download</button></li>
                            <li><button class="delete" title="Delete" *ngIf="model.type!='vdir'" (click)="onDelete($event)">Delete</button></li>
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
        }`,
        `
        .fi.vdir i::before,
        .fi.application i::before {
            content: "\\f07b";
            color: #FFE68E;
        }

        .fi.vdir i::after {
            content: "\\f0da";
        }

        .fi.application i::after {
            content: "\\f121";
        }
	`
    ],
    styleUrls: [
        '../../files/file-icons.css'
    ]
})
export class WebFileComponent {
    @Input() model: WebFile;
    @Output() modelChanged: EventEmitter<any> = new EventEmitter();
    @ViewChild(Selector) selector: Selector;

    private _editing = false;

    constructor(
        private _route: ActivatedRoute,
        private _service: WebFilesService,
        private _notificationService: NotificationService,
        @Inject("FilesService") private _fileService: FilesService,
    ) {
    }

    get displayDate(): string {
        return Humanizer.date(this.model.file_info.last_modified);
    }
    
    rename(name: string) {
        if (name) {
            this._service.rename(this.model, name);
            this.modelChanged.emit(this.model);
        }

        this._editing = false;
    }

    onCancel(e: Event) {
        e.preventDefault();
        this.selector.close();

        this.cancel();
    }

    onBlur(event: Event) {
        if (event && event.target && (<HTMLInputElement>event.target).value === this.model.name) {

            //
            // No change. Force cancel
            this.cancel();
        }
    }

    onRename(e: Event) {
        e.preventDefault();
        this.selector.close();

        if (this.model.type == WebFileType.Vdir) {
            return;
        }

        this._editing = true;
    }

    onDelete(e: Event) {
        e.preventDefault();
        this.selector.close();

        this._notificationService.confirm("Delete File", "Are you sure you want to delete " + this.model.name)
            .then(confirmed => {
                if (confirmed) {
                    this._service.delete([this.model]);
                }
            });
    }

    onDownload(e: Event) {
        e.preventDefault();
        this.selector.close();

        this._fileService.download(this.model.file_info);
    }

    prevent(e: Event) {
        e.preventDefault();
    }

    cancel() {
        this.selector.close();
        this._editing = false;
    }

    openSelector(e: Event) {
        this.selector.toggle();
    }

    getSize() {
        return this.model.file_info.size ? Humanizer.number(Math.ceil(this.model.file_info.size / 1024)) + ' KB': null;
    }

    browse(e: Event) {
        if (e && e.defaultPrevented) {
            return;
        }

        this._service.load(this.model.path);
    }
}
