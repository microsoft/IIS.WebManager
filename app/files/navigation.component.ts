import { NgModule, Component, OnInit, OnDestroy, ViewChild, ElementRef, Input, Output, EventEmitter, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from "rxjs/Observable";
import { Subscription } from "rxjs/Subscription";
import { ComponentUtil } from '../utils/component';
import { Module as BModel } from '../common/bmodel';
import { INavigation } from './inavigation';

export class Drop {
    public event: DragEvent;
    public destination: string;
}

@Component({
    selector: 'navigation',
    template: `
        <div>
            <button class="no-border pull-left color-active" title="Go Up" (click)="onClickUp($event)"><i class="fa fa-level-up"></i></button>
            <div class="fill">
                <ul *ngIf="_crumbs.length > 0" [hidden]="_typing" class="nav border-color" (click)="onClickAddress($event)">
                    <li *ngFor="let item of _crumbs; let i = index;" 
                        (dragover)="dragOver(i, $event)" 
                        (drop)="onDrop(i, $event)"
                        (dragleave)="_selected=-1">
                        <span class="crumb hover-active" [class.background-active]="i==_selected" (click)="onClickCrumb(i, $event)">{{item}}</span>/
                    </li>
                </ul>
                <input #addressBar type="text" class="form-control" *ngIf="_crumbs.length > 0" [hidden]="!_typing" [ngModel]="_path" (ngModelChange)="onPathChanged($event)" throttle  />
            </div>
        </div>
    `,
    styles: [`
        button {
            padding: 6px 8px;
        }

        .crumb {
            cursor: pointer;
            padding: 0 1px;
            direction: ltr;
        }

        .crumb:empty:before {
            font-family: FontAwesome;
            content: "\\f115";
            padding: 0 2px;
        }

        .nav {
            border-style: solid;
            border-width: 1px;
            padding: 8px 4px;
            height: 36px;
        }

        .nav li {
            display: inline-block;
        }

        input {
            height: 36px;
            padding: 8px;
        }

        .fill {
            width: auto;
            overflow: hidden;
        }

        .crumb-list-wrapper {
            height: 36px;
            overflow: hidden;
        }

        .crumb-list-wrapper > div {
            display: inline-block;
            position: relative;
        }

        .crumb-list {
            white-space: nowrap;
            position: absolute;
            right: 0;
        }

        .place-holder {
            display: inline-block;
            overflow: hidden;
            height: 0px;
            visibility: hidden;
            word-break: break-all;
        }

        .crumb-list > li, .place-holder > li {
            display: inline-block;
        }
    `],
    host: {
        '(document:click)': 'dClick($event)'
    }
})
export class NavigationComponent implements OnInit, OnDestroy {
    private _path = "";
    private _selected: number;
    private _typing: boolean = false;
    private _crumbs: Array<string> = []
    private _subscriptions: Array<Subscription> = [];
    @ViewChild('addressBar') private _addressBar: ElementRef;

    @Input() public current: Observable<string> = new Observable<string>();
    @Output() public load: EventEmitter<string> = new EventEmitter<string>();
    @Output() public drop: EventEmitter<Drop> = new EventEmitter<Drop>();

    constructor(private _eRef: ElementRef,
                @Inject("INavigation") private _navigator: INavigation) {
    }

    public ngOnInit() {
        this._subscriptions.push(this._navigator.path.subscribe(path => {
            this.path = path;
        }))
    }

    public ngOnDestroy() {
        for (var sub of this._subscriptions) {
            sub.unsubscribe();
        }
    }

    public set path(val: string) {
        val = val.replace(/\\/g, "/");
        let v = val;

        // _path always ends with '/'
        if (v.charAt(v.length - 1) != '/') {
            v = v + '/';
        }
        this._path = v;

        // _crumbs always split from path without leading slash
        if (val[val.length - 1] == '/') {
            val = val.substr(0, val.length - 1);
        }

        this._crumbs = val.split('/');
    }

    private onPathChanged(path: string) {

        if (path == "" || path.charAt(0) != "/") {
            path = "/" + path;
        }
        
        this._navigator.onPathChanged(path);
    }

    private onClickCrumb(index: number, e: Event): void {
        e.preventDefault();
        
        this._navigator.onPathChanged(this.getPath(index) || "/");
    }

    private onClickAddress(e: Event) {
        if (e.defaultPrevented) {
            return;
        }

        this._typing = true;

        setTimeout(() => {
            this._addressBar.nativeElement.focus();
        }, 1);
    }

    private onClickUp() {
        let curPath = this._path;

        if (!curPath) {
            return;
        }

        // Trim trailing '/'
        if (curPath.charAt(curPath.length - 1) == '/') {
            curPath = curPath.substr(0, curPath.length - 1);
        }

        let parts = curPath.split('/');
        if (parts.length <= 0) {
            return;
        }

        let newParts = [];

        for (let i = 0; i < parts.length - 1; i++) {
            newParts.push(parts[i]);
        }

        this.onPathChanged(newParts.join('/'));
    }

    private dClick(evt) {
        if (!this._typing) {
            return;
        }

        var inside = ComponentUtil.isClickInsideComponent(evt, this._eRef);

        if (!inside) {
            this.reset();
        }
    }

    private reset() {
        this.path = this._path
        this._addressBar.nativeElement.value = this._path;
        this._typing = false;
    }

    private getPath(index: number): string {
        var parts = [];
        for (var i = 0; i <= index; i++) {
            parts.push(this._crumbs[i]);
        }

        return parts.join("/") || "/";
    }

    private dragOver(index: number, e: DragEvent) {
        e.stopPropagation();
        e.preventDefault();

        if (e.dataTransfer.effectAllowed.toLowerCase() == "copymove") {
            e.dataTransfer.dropEffect = e.ctrlKey ? "copy" : "move";
        }
        else if (e.dataTransfer.effectAllowed == "all") {
            e.dataTransfer.dropEffect = "copy";
        }

        this._selected = index;
    }

    private onDrop(index: number, e: DragEvent) {
        e.stopPropagation();
        e.preventDefault();

        this._selected = -1;
        this._navigator.drop({ event: e, destination: this.getPath(index) });
    }
}

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        BModel
    ],
    exports: [
        NavigationComponent
    ],
    declarations: [
        NavigationComponent
    ]
})
export class Module { }