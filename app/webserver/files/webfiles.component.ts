import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { WebFilesService } from './webfiles.service';
import { WebFile } from './webfile';
import { WebFileListComponent } from './webfile-list';
import { WebSite } from '../websites/site';

@Component({
    template: `
        <file-editor *ngIf="_current && !isDir(_current)" [file]="_current.file_info"></file-editor>
        <webfile-explorer *ngIf="isDir(_current)"></webfile-explorer>
    `
})
export class WebFilesComponent implements OnInit, OnDestroy {
    private _current: WebFile;
    private _subscriptions: Array<Subscription> = [];
    @ViewChild(WebFileListComponent) private _list: WebFileListComponent;
    
    public website: WebSite;

    constructor(private _svc: WebFilesService) {
        this._subscriptions.push(_svc.current.filter(dir => !!dir).subscribe(dir => this._current = dir));
    }

    public ngOnInit() {
        this._svc.init(this.website);
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(sub => sub.unsubscribe());
    }

    private isDir(file: WebFile) {
        return WebFile.isDir(file);
    }
}