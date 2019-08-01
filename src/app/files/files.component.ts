import { Component, OnInit, OnDestroy, Input, Inject, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiFile, ExplorerOptions } from './file';
import { FilesService } from './files.service';
import { FileNavService } from './file-nav.service';
import { NavigationHelper } from './navigation-helper';
import { FileExplorer } from './file-explorer';

@Component({
    selector: 'file-viewer',
    template: `
        <file-editor *ngIf="_current && !isDir(_current)" [file]="_current"></file-editor>
        <file-explorer *ngIf="isDir(_current)" [types]="types" [options]="options"></file-explorer>
    `,
    providers: [
        FileNavService,
        { provide: "INavigation", useClass: NavigationHelper }
    ]
})
export class FilesComponent implements OnInit, OnDestroy {
    private _current: ApiFile;
    private _subscriptions: Array<Subscription> = [];
    @ViewChild(FileExplorer) private _list: FileExplorer;

    @Input() public options: ExplorerOptions = ExplorerOptions.AllEnabled;
    @Input() public types: Array<string> = [];
    @Input() public useHash: boolean = true;
    @Input() public defaultPath: string = null;

    constructor(@Inject("FilesService") private _svc: FilesService,
                private _navSvc: FileNavService) {
        
        this._subscriptions.push(this._navSvc.current.subscribe(dir => {
            if (dir) {
                this._current = dir;
            }
        }));
    }

    public get selected(): Array<ApiFile> {
        if (this._list && this._list.selected && this._list.selected.length > 0) {
            return this._list.selected;
        } else if (this._current && this._current.physical_path) {
            return [ this._current ];
        } else {
            return [];
        }
    }

    public ngOnInit() {
        this.activate();
    }

    public activate() {
        if (!this._current) {
            this._navSvc.init(this.useHash, this.defaultPath);
        }
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(sub => sub.unsubscribe());

        if (this._navSvc) {
            this._navSvc.dispose();
            this._navSvc = null;
        }
    }

    private isDir(f: ApiFile): boolean {
        return ApiFile.isDir(f);
    }
}
