import { Component, OnDestroy, ViewChild } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { WebFileListComponent } from './webfile-list';
import { WebFilesService } from './webfiles.service';
import { WebFile } from './webfile';
import { WebSite } from '../websites/site';

@Component({
    selector: 'webfile-explorer',
    template: `
        <file-selector #fileSelector class="right" (selected)="upload($event)" [multiple]="true">
        </file-selector>
        <toolbar
            [newLocation]="null"
            [refresh]="true"
            [newFile]="_list && !_list.creating"
            [newFolder]="_list && !_list.creating"
            [upload]="true"
            [delete]="_list && _list.selected.length > 0"
            (onRefresh)="refresh()"
            (onNewFolder)="createDirectory()"
            (onNewFile)="createFile()"
            (onUpload)="fileSelector.open()"
            (onDelete)="deleteFiles(_list.selected)">
	    </toolbar>
        <navigation></navigation>
        <webfile-list *ngIf="isDir(_current)"></webfile-list>
    `,
    styles: [`
        navigation {
            padding-bottom: 25px;
            display: block;
        }
    `]
})
export class WebFileExplorer implements OnDestroy {
    private _current: WebFile;
    private _subscriptions: Array<Subscription> = [];
    @ViewChild(WebFileListComponent) private _list: WebFileListComponent;

    constructor(private _svc: WebFilesService) {
        this._subscriptions.push(_svc.current.filter(dir => !!dir).subscribe(dir => this._current = dir));
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(sub => sub.unsubscribe());
    }

    private refresh() {
        this._list.refresh();
    }

    private createDirectory() {
        this._list.createDirectory();
    }

    private createFile() {
        this._list.createFile();
    }

    private deleteFiles(files: Array<WebFile>) {
        this._list.deleteFiles(files);
    }

    private upload(files: Array<File>) {
        this._svc.upload(files, this._current);
    }

    private isDir(file: WebFile) {
        return WebFile.isDir(file);
    }
}
