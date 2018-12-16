import { Component, OnInit, OnDestroy, Output, Input, Inject, ViewChild, ElementRef } from '@angular/core';

import 'rxjs/add/operator/buffer';
import 'rxjs/add/operator/take';
import { Subscription } from 'rxjs/Subscription';
import { IntervalObservable } from 'rxjs/observable/IntervalObservable';

import { NotificationService } from '../notification/notification.service';
import { OrderBy, SortPipe } from '../common/sort.pipe';
import { FilterPipe } from '../common/filter.pipe';
import { Range } from '../common/virtual-list.component';

import { ApiFile, ApiFileType, MimeTypes } from './file';
import { Location } from './location';
import { FilesService } from './files.service';
import { FileNavService } from './file-nav.service';


@Component({
    selector: 'file-list',
    template: `
        <div #dragInfo class="drag-info background-active">
            {{_selected.length}}
        </div>
        <div *ngIf="_current" class="col-xs-8 col-sm-4 col-md-2 actions filter hidden-xs">
            <input type="search" class="form-control" [class.border-active]="_filter" [(ngModel)]="_filter" (ngModelChange)="filter($event)" [throttle]="300" />
        </div>
        <div *ngIf="_current" tabindex="-1" class="wrapper" 
            [selectable]="_items"
            [selected]="_selected"

            (blur)="onBlur($event)"
            (keyup.delete)="deleteFiles($event, _selected)"

            (drop)="drop($event)"
            (dragover)="dragOver($event)"
            (dragend)="dragEnd($event)"
            (mouseup)="_active=null"

            (copy)="copy($event)"
            (cut)="copy($event)"
            (paste)="paste($event)">
            <input class="out" type="text"/>
            <div #header class="container-fluid hidden-xs">
                <div class="border-active grid-list-header row">
                    <label class="col-xs-8 col-sm-5 col-lg-4 hidden-xs" [ngClass]="_orderBy.css('name')" (click)="sort('name')"
                        tabindex="0" aria-label="Name Header" role="button" (keyup.enter)="sort('name')" (keyup.space)="sort('name')">Name</label>
                    <label class="col-sm-3 col-md-2 hidden-xs" [ngClass]="_orderBy.css('last_modified')" (click)="sort('last_modified')"
                        tabindex="0" aria-label="Last Modified Header" role="button" (keyup.enter)="sort('last_modified')" (keyup.space)="sort('last_modified')">Last Modified</label>
                    <label class="col-md-2 visible-lg visible-md" [ngClass]="_orderBy.css('description')" (click)="sort('description')"
                        tabindex="0" aria-label="Type Header" role="button" (keyup.enter)="sort('description')" (keyup.space)="sort('description')">Type</label>
                    <label class="col-md-1 visible-lg visible-md text-right" [ngClass]="_orderBy.css('size')" (click)="sort('size')"
                        tabindex="0" aria-label="Size Header" role="button" (keyup.enter)="sort('size')" (keyup.space)="sort('size')">Size</label>
                </div>
            </div>
            <selector #editSelector [opened]="true" *ngIf="_newLocation" class="container-fluid" (hide)="_newLocation=null">
                <edit-location [model]="_newLocation" (cancel)="_newLocation=null" (save)="onSaveNewLocation()"></edit-location>
            </selector>
            <div class="grid-list container-fluid" *ngIf="_newDir">
                <new-file [model]="_newDir" (cancel)="_newDir=null" (save)="onSaveNewDir()"></new-file>
            </div>
            <virtual-list class="container-fluid grid-list"
                        *ngIf="_items"
                        [count]="_items.length"
                        (rangeChange)="onRangeChange($event)">
                <li class="hover-editing" tabindex="-1" 
                    *ngFor="let child of _view"
                    #marker="itemMarker"
                    [class.background-selected]="_active == child || marker.isSelected"
                    (dblclick)="onBrowseChild(child, $event)"
                    dragable="true"
                    (dragstart)="drag(child, $event)"
                    (drop)="drop($event, child)"
                    (dragenter)="onDragItemEnter(child, $event)"
                    (dragleave)="onDragItemLeave(child, $event)"
                    (keyup.space)="select(child)">
                    <file [model]="child" (modelChanged)="doSort()"></file>
                </li>
            </virtual-list>
        </div>
    `,
    styles: [`
        .container-fluid,
        .row {
            margin: 0;
            padding: 0;
        }

        .grid-list-header label {
            padding-top: 5px;
        }

        .wrapper {
            min-height: 40vh;
        }

        .out {
            position: absolute; 
            left: -1000px;
        }

        .drag-info {
            position: absolute;
            transform: translateX(-500px);
            padding: 0 5px;
            font-size: 120%;
        }
    `]
})
export class FileListComponent implements OnInit, OnDestroy {
    private _current: ApiFile;
    private _filter: string = "";
    private _newDir: ApiFile = null;
    private _newLocation: Location = null;
    private _ignoreDragLeave: boolean;
    private _orderBy: OrderBy = new OrderBy();
    private _sortPipe: SortPipe = new SortPipe();
    private _subscriptions: Array<Subscription> = [];
    @ViewChild('dragInfo') private _dragInfo: ElementRef;

    private _range: Range = new Range(0, 0);
    private _selected: Array<ApiFile> = [];
    private _items: Array<ApiFile> = [];
    private _view: Array<ApiFile> = [];

    private _active: ApiFile;

    @Input() public types: Array<string> = [];

    constructor(@Inject("FilesService") private _svc: FilesService,
                private _navSvc: FileNavService,
                private _notificationService: NotificationService) {
    }

    public get creating(): boolean {
        return !!this._newDir || !!this._newLocation;
    }

    public get selected(): Array<ApiFile> {
        return this._selected;
    }

    public ngOnInit() {
        let fileStream = this._navSvc.files.map(items => {
            return this.types.length == 0 ? items : items.filter(f => this.types.findIndex(t => t === f.type) != -1);
        });

        // 
        // Current dir change
        this._subscriptions.push(this._navSvc.current.subscribe(f => {
            this._current = f;
            this._filter = "";

            this.clearSelection();
            this._items = [];
        }));

        // 
        // Files change
        this._subscriptions.push(fileStream.subscribe(files => {
            if (this._items.length == 0) {
                this._items = files;
            }
        }));

        this._subscriptions.push(fileStream.buffer(IntervalObservable.create(300)).filter(v => v.length > 0).subscribe(_ => {
            this._filter = "";
            this.filter();
        }));
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(sub => sub.unsubscribe());
    }

    public refresh() {
        this._navSvc.load(this._current.physical_path);
    }

    public createLocation() {
        this.clearSelection();

        let alias = "sites"
        let index = 0;

        //
        // Avoid new name collision

        while (this._items.length > 0 && 
                (this._items.find(item => item.isLocation && item.name.toLowerCase() == alias) != null ||
                 this._items.find(item => item.isLocation && item.alias && item.alias.toLowerCase() == alias) != null))
        {
            index++;
            alias = "sites (" + index + ")";
        }

        let location = new Location();

        location.alias = alias;
        location.path = "%systemdrive%\\" + alias;

        location.claims = [
            "read",
            "write"
        ];

        this._active = null;

        this._newLocation = location;
    }

    public createDirectory() {
        this.clearSelection();

        let name = "New Folder";
        let index = 0;

        while (this._items.length > 0 && this._items.find(item => item.name.toLocaleLowerCase() == name.toLocaleLowerCase()) != null) {
            index++;
            name = "New Folder (" + index + ")";
        }

        let dir = new ApiFile();

        dir.name = name;
        dir.parent = this._current;
        dir.type = ApiFileType.Directory;

        this._active = null;
        this._newDir = dir;
    }

    public createFile() {
        this.clearSelection();

        let name = "new.html";
        let index = 0;

        while (this._items.length > 0 && this._items.find(item => item.name.toLocaleLowerCase() == name.toLocaleLowerCase()) != null) {
            index++;
            name = "new (" + index + ").html";
        }

        let file = new ApiFile();

        file.name = name;
        file.parent = this._current;
        file.type = ApiFileType.File;

        this._active = null;
        this._newDir = file;
    }

    public deleteFiles(e: Event, files: Array<ApiFile>) {
        if (e.defaultPrevented) {
            return;
        }

        if (files && files.length < 1) {
            return;
        }

        if (this.atRoot()) {
            return this.deleteLocations(files);
        }

        let msg = files.length == 1 ? "Are you sure you want to delete '" + files[0].name + "'?" :
            "Are you sure you want to delete " + files.length + " items?";

        this._notificationService.confirm("Delete File", msg)
            .then(confirmed => {
                if (confirmed) {
                    this._svc.delete(files);
                }
                this.clearSelection();
            });
    }

    private deleteLocations(files: Array<ApiFile>) {

        let msg = files.length == 1 ? "Are you sure you want to remove the root folder '" + files[0].name + "'?" :
            "Are you sure you want to remove " + files.length + " root folders?";

        this._notificationService.confirm("Delete Root Folder", msg)
            .then(confirmed => {
                if (confirmed) {
                    this._svc.deleteLocations(files);
                }
                this.clearSelection();
            });
    }

    private onBlur(e: FocusEvent) {
        let target: any = e.relatedTarget;
        if (target && target.attributes && target.attributes.nofocus) {
            e.preventDefault();
            e.stopImmediatePropagation();
            return false;
        }

        this.clearSelection();
    }

    private selectAll(event: Event) {
        event.preventDefault();
        this._selected = this._items.slice(0);
    }

    private onBrowseChild(file: ApiFile, e) {
        if (e && e.defaultPrevented) {
            return;
        }

        this.clearSelection();

        this._navSvc.load(file.physical_path);
    }

    private onRangeChange(range: Range) {
        Range.fillView(this._view, this._items, range);
        this._range = range;
    }

    private sort(field: string) {
        this._orderBy.sort(field, false);
        this.doSort();
    }

    private doSort() {
        // Sort
        let stringCompare = this._orderBy.Field == "name" || this._orderBy.Field == "description";

        this._items = this._sortPipe.transform(this._items, this._orderBy.Field, this._orderBy.Asc, (x, y, f1: ApiFile, f2: ApiFile) => {
            if (f1.type != f2.type) {
                if (f1.type == ApiFileType.File) return 1;
                if (f2.type == ApiFileType.File) return -1;
            }

            if (stringCompare) {
                return x.localeCompare(y);
            }

            return <number>(x < y ? -1 : x > y);
        });

        this.onRangeChange(this._range);
    }

    private onSaveNewDir() {
        if (!this._newDir) {
            return;
        }

        let existing = this._items.find(f => f.name == this._newDir.name);

        if (!existing) {
            this._svc.create(this._newDir, this._current);
        }

        this._newDir = null;
    }

    private onSaveNewLocation() {
        if (!this._newLocation) {
            return;
        }

        let existing = this._items.find(f => f.name == this._newLocation.alias);

        if (!existing) {
            this._svc.createLocation(this._newLocation);
        }

        this._newLocation = null;
    }

    private clearSelection(file: ApiFile = null) {
        this._selected.splice(0);
        this._newDir = null;
    }

    private filter() {
        this._navSvc.files.take(1).subscribe(files => {
            if (this._filter) {
                let filter = ("*" + this._filter + "*").replace("**", "*").replace("?", "");

                let rule = new RegExp("^" + filter.split("*").join(".*") + "$", "i");
                this._items = files.filter(f => rule.test(f.name));
            }
            else {
                this._items = files;
            }

            if (this.types.length > 0) {
                this._items = this._items.filter(f => this.types.findIndex(t => t == f.type) != -1);
            }

            this.doSort();
        });
    }

    private dragOver(e: DragEvent) {
        e.stopPropagation();
        e.preventDefault();

        if (e.dataTransfer.effectAllowed.toLowerCase() == "copymove") {
            e.dataTransfer.dropEffect = e.ctrlKey ? "copy" : "move";
        }
        else if (e.dataTransfer.effectAllowed == "all") {
            e.dataTransfer.dropEffect = "copy";
        }
    }

    private select(f) {
        this.clearSelection();
        this._selected.push(f);
    }

    private drag(f: ApiFile, e: DragEvent) {
        if (!this._selected.find(s => s === f)) {
            this._selected.push(f);
        }

        this._svc.drag(e, this._selected);

        let dt = e.dataTransfer;

        if ((<any>dt).setDragImage) {
            if (this._selected.length > 1) {
                (<any>dt).setDragImage(this._dragInfo.nativeElement, -20, -10);
            }

            if (this._selected.length == 1) {
                (<any>dt).setDragImage(e.target, -20, -10);
            }
        }
    }

    private drop(e: DragEvent, dest: ApiFile) {
        e.stopImmediatePropagation();
        e.preventDefault();

        dest = ApiFile.isDir(dest) && !this._svc.getDraggedFiles(e).some(f => ApiFile.equal(f, dest)) ? dest : this._current;

        if (!dest.id) {
            // Destination undefined when dropping root directories
            return;
        }

        this._svc.drop(e, dest);
        this.clearSelection();
    }

    private dragEnd(e: DragEvent) {
        e.preventDefault();
        e.stopImmediatePropagation();

        // Refresh
        // Need when d&d is performed between windows
        if (e.dataTransfer.dropEffect == "move" && this.selected.length > 0) {
            this.refresh();
        }

        this.clearSelection();
    }

    private onDragItemEnter(f: ApiFile, e: DragEvent) {
        e.preventDefault();
        e.stopImmediatePropagation();

        let active = ApiFile.isDir(f) ? f : null;

        //
        // Entered the already active item, meaning a leave will be triggered
        if (active == this._active) {
            this._ignoreDragLeave = true;
        }

        this._active = active;
    }

    private onDragItemLeave(f: ApiFile, e: DragEvent) {
        if (this._ignoreDragLeave) {
            this._ignoreDragLeave = false;
            return;
        }

        if (this._active == f) {
            this._active = null;
        }
    }

    private copy(e: ClipboardEvent) {
        this._svc.clipboardCopy(e, this._selected);
    }

    private paste(e: ClipboardEvent) {
        if (e.clipboardData && this._current.id) {
            this._svc.clipboardPaste(e, this._current);
        }
    }

    private atRoot(): boolean {
        return !!(this._current && !this._current.physical_path);
    }
}
