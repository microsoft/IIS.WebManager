import { Component, Input, Output, Inject, ViewChild, EventEmitter } from '@angular/core';

import { Selector } from '../../common/selector';
import { NotificationService } from '../../notification/notification.service';
import { Humanizer } from '../../common/primitives';

import { FilesService } from '../../files/files.service';
import { WebFilesService } from './webfiles.service';
import { WebFileType, WebFile } from './webfile';

@Component({
    selector: 'file',
    template: `
        <div *ngIf="model" class="grid-item row" [class.background-editing]="_editing" (keyup.f2)="onRename($event)" tabindex="-1">
            <div class="col-xs-9 col-sm-5 col-lg-4 fi" [ngClass]="[model.type, !model.file_info ? '' : model.file_info.extension]">
                <div *ngIf="!_editing">
                    <a class="color-normal hover-color-active" [href]="href" nofocus><i></i>{{model.name}}</a>
                </div>
                <div *ngIf="_editing">
                    <i></i>
                    <input class="form-control" type="text" 
                           [ngModel]="model.name"
                           (ngModelChange)="rename($event)"
                           (keyup.esc)="onCancel($event)"
                           (keyup.delete)="$event.stopImmediatePropagation()"
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
                    <button title="More" *ngIf="!model.isVirtual" (click)="openSelector($event)" (dblclick)="prevent($event)" [class.background-active]="(selector && selector.opened) || false">
                        <i class="fa fa-ellipsis-h"></i>
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

        .fi {
            padding-left: 0;
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
        'app/files/file-icons.css'
    ]
})
export class WebFileComponent {
    @Input() model: WebFile;
    @Output() modelChanged: EventEmitter<any> = new EventEmitter();

    @ViewChild(Selector) selector: Selector;

    private _editing = false;

    constructor(private _service: WebFilesService,
                @Inject("FilesService") private _fileService: FilesService) {
    }
    
    private get href() {
        return window.location.pathname + "#" + this.model.path;
    }

    private get displayDate(): string {
        return Humanizer.date(this.model.file_info.last_modified);
    }
    
    private rename(name: string) {
        if (this._editing && name) {
            this._service.rename(this.model, name);
            this.modelChanged.emit(this.model);
        }

        this._editing = false;
    }

    private onCancel(e: Event) {
        e.preventDefault();
        this.selector.close();

        this.cancel();
    }

    private onRename(e: Event) {
        e.preventDefault();
        this.selector.close();

        if (this.model.type == WebFileType.Vdir) {
            return;
        }

        this._editing = true;
    }

    private onDelete(e: Event) {
        e.preventDefault();
        this.selector.close();

        if (confirm("Are you sure you want to delete " + this.model.name)) {
            this._service.delete([this.model]);
        }
    }

    private onDownload(e: Event) {
        e.preventDefault();
        this.selector.close();

        this._fileService.download(this.model.file_info);
    }

    private prevent(e: Event) {
        e.preventDefault();
    }

    private cancel() {
        this.selector.close();
        this._editing = false;
    }

    private openSelector(e: Event) {
        this.selector.toggle();
    }

    private getSize() {
        return this.model.file_info.size ? Humanizer.number(Math.ceil(this.model.file_info.size / 1024)) + ' KB': null;
    }   
}
