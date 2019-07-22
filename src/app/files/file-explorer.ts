import { Component, OnDestroy, Input, Inject, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiFile, ExplorerOptions } from './file';
import { FileListComponent } from './file-list';
import { FilesService } from './files.service';
import { FileNavService } from './file-nav.service';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'file-explorer',
    template: `
        <file-selector #fileSelector class="right" (selected)="upload($event)" [multiple]="true">
        </file-selector>
        <file-system-toolbar
            [refresh]="options.EnableRefresh || null"
            [newFile]="(options.EnableNewFile || null) && !atRoot()"
            [newLocation]="(options.EnableNewFolder || null) && showNewLocation()"
            [newFolder]="(options.EnableNewFolder || null) && showNewFolder()"
            [upload]="(options.EnableUpload || null) && !atRoot()"
            [delete]="(options.EnableDelete || null) && selected && selected.length > 0"
            (onNewLocation)="createMapping()"
            (onRefresh)="refresh()"
            (onNewFolder)="createDirectory()"
            (onNewFile)="createFile()"
            (onUpload)="fileSelector.open()"
            (onDelete)="deleteFiles($event, selected)"></file-system-toolbar>
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

    @Input() public options: ExplorerOptions = new ExplorerOptions(true);
    @Input() public types: Array<string> = [];

    constructor(@Inject("FilesService") private _svc: FilesService,
                private _navSvc: FileNavService) {

        this._subscriptions.push(this._navSvc.current.pipe(
            filter(f => !!f)
        ).subscribe(f => this._current = f));
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

    private createMapping() {
        this._list.createLocation();
    }

    private createDirectory() {
        this._list.createDirectory();
    }

    private createFile() {
        this._list.createFile();
    }

    private deleteFiles(event: Event, files: Array<ApiFile>) {
        this._list.deleteFiles(event, files);
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

    private showNewLocation() {

        //
        // If the list is being used to create a folder/dir hide the button

        if (!(this._list && !this._list.creating)) {
            return null;
        }

        return this.atRoot() || null;
    }

    private showNewFolder() {

        //
        // If the list is being used to create a folder/dir disable the button

        if (!(this._list && !this._list.creating)) {
            return false;
        }

        return !this.atRoot() || null;
    }
}