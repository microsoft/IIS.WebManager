import { Component, OnDestroy, Input, Inject, ViewChild } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { ApiFile, ApiFileType } from './file';
import { FileListComponent } from './file-list';
import { FilesService } from './files.service';
import { FileNavService } from './file-nav.service';

@Component({
    selector: 'file-explorer',
    template: `
        <file-selector #fileSelector class="right" (selected)="upload($event)" [multiple]="true">
        </file-selector>
        <toolbar
            [refresh]="true"
            [newFile]="!atRoot()"
            [newFolder]="!_newDir && !atRoot()"
            [upload]="!atRoot()"
            [delete]="selected && selected.length > 0"
            (onRefresh)="refresh()"
            (onNewFolder)="createDirectory()"
            (onNewFile)="createFile()"
            (onUpload)="fileSelector.open()"
            (onDelete)="deleteFiles(selected)"></toolbar>
        <navigation></navigation>
        <file-list *ngIf="isDir(_current)" [types]="types"></file-list>
    `,
    styles: [`
        navigation {
            padding-bottom: 25px;
            display: block;
        }
    `]
})
export class FileExplorer implements OnDestroy {
    private _current: ApiFile;
    private _subscriptions: Array<Subscription> = [];
    @ViewChild(FileListComponent) private _list: FileListComponent;

    @Input() public types: Array<string> = [];

    constructor(@Inject("FilesService") private _svc: FilesService,
                private _navSvc: FileNavService) {

        this._subscriptions.push(this._navSvc.current.filter(f => !!f).subscribe(f => this._current = f));
    }

    public get selected(): Array<ApiFile> {
        const empty = [];
        return !this._list ? empty : this._list.selected;
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

    private deleteFiles(files: Array<ApiFile>) {
        this._list.deleteFiles(files);
    }

    private upload(files: Array<File>) {
        this._svc.upload(this._current, files);
    }

    private isDir(f: ApiFile): boolean {
        return ApiFile.isDir(f);
    }

    private atRoot(): boolean {
        return !!(this._current && !this._current.physical_path);
    }
}
