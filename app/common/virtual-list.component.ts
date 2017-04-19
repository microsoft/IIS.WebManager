import {NgModule, Component, OnInit, OnDestroy, OnChanges, AfterContentInit, Output, Input, EventEmitter, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef, SimpleChange, ContentChildren, QueryList, Directive} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {Subscription} from "rxjs/Subscription";

import {WindowService} from '../main/window.service';
import {ComponentUtil} from '../utils/component';

export class Range {

    public start: number;
    public length: number;

    constructor(start: number, length: number) {
        this.start = start;
        this.length = length;
    }

    public static fillView(view: Array<any>, from: Array<any>, range: Range) {
        view.splice(0);

        let end = range.start + range.length < from.length ? range.start + range.length : from.length;

        for (let i = range.start; i < end; i++) {
            view.push(from[i]);
        }
    }
}

@Directive({
    selector: 'li'
})
export class VirtualListItem {
    constructor(public host: ElementRef) {
    }
}

@Component({
    selector: 'virtual-list',
    template: `
        <ul #container>
            <li [style.height]="preHeight + 'px'"></li>
            <ng-content></ng-content>
            <li [style.height]="postHeight + 'px'"></li>
        </ul>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class VirtualListComponent implements OnDestroy, OnChanges, AfterContentInit {

    @Input() count: number = -1;
    @Input() list: Array<any>;
    @Output() rangeChange: EventEmitter<Range> = new EventEmitter<Range>();
    @Output('filtered') _filtered: EventEmitter<Array<any>> = new EventEmitter<Array<any>>();

    @ViewChild("container") private _container: ElementRef;
    @ContentChildren(VirtualListItem) private _listItems: QueryList<VirtualListItem>;
    private _subscriptions: Array<Subscription> = [];

    private _navHeight: number = 50;
    private _bufferSize: number = 20;

    private _unknownMax = 50;
    private _heightKnown = false;
    private _dirty: boolean = false;
    private _prevStart: number = -1;
    private _prevLength: number = -1

    private _listSize: number = 0;
    private _scrollTop: number = 0;
    private _preHeight: number = 0;
    private _postHeight: number = 0;
    private _totalHeight: number = 0;
    private _elementHeight: number = 1;
    private _screenHeight = window.innerHeight - this._navHeight;

    public filtered: Array<any> = [];

    public get elementRef(): ElementRef {
        return this._container;
    }

    constructor(private _svc: WindowService,
                private _changeDetector: ChangeDetectorRef) {
    }

    private ngOnInit() {
        this._subscriptions.push(this._svc.scroll.subscribe(e => {
            this.onChangeHandler();
        }));

        this._subscriptions.push(this._svc.resize.subscribe(e => {
            this.onChangeHandler();
        }));

        this._filtered.subscribe(arr => {
            this.filtered = arr;
        });
    }

    public ngOnChanges(changes: { [key: string]: SimpleChange; }): any {
        this._dirty = true;
        this.onChangeHandler();
    }

    public ngAfterContentInit() {
        let sub = this._listItems.changes.subscribe((v: QueryList<VirtualListItem>) => {
            if (v.length > 0 && !this._heightKnown && v.first.host.nativeElement.offsetHeight) {
                this._elementHeight = v.first.host.nativeElement.offsetHeight;
                this._heightKnown = true;
                this.onChangeHandler();
                sub.unsubscribe();
            }
        });
        // Fallback to unsubscribe even if list is never populated
        this._subscriptions.push(sub);
    }

    private onChangeHandler() {
        if (this.list || this.count != -1) {
            this._screenHeight = window.innerHeight - this._navHeight;
            this._totalHeight = this.count * this._elementHeight;
            this._listSize = this._screenHeight + this._bufferSize * this._elementHeight;
            this._scrollTop = this.scrollTop;
            this._preHeight = this.preHeight;
            this._postHeight = this.postHeight;

            let startIndex = Math.floor(this._preHeight / this._elementHeight);
            let length = Math.floor(this._listSize / this._elementHeight);

            if (!this._heightKnown) {
                length = Math.min(length, this._unknownMax);
            }

            this._changeDetector.markForCheck();

            if (this._prevStart != startIndex || this._prevLength != length || this._dirty) {
                this._dirty = false;
                this._prevLength = length;
                this._prevStart = startIndex;

                this.rangeChange.next(new Range(startIndex, length));

                if (this.list) {
                    this._filtered.next(this.list.filter((f, i) => {
                        return i >= startIndex && i < startIndex + length;
                    }));
                }
            }
        }
    }

    private get scrollTop(): number {
        if (!this._container) {
            return 0;
        }

        let top = (ComponentUtil.offset(this._container.nativeElement).top - this._navHeight);
        return top > 0 ? 0 : -top;
    }

    private get preHeight(): number {
        if (this._scrollTop == 0) {
            return 0;
        }

        let val = Math.floor(this._scrollTop / this._elementHeight) * this._elementHeight + this._screenHeight / 2 - (this._listSize / 2);

        return val < 0 ? 0 : val;
    }

    private get postHeight(): number {
        let val = this._totalHeight - this._scrollTop - this._listSize;
        return val < 0 ? 0 : val;
    }

    public ngOnDestroy() {
        for (let sub of this._subscriptions) {
            sub.unsubscribe();
        }
    }
}

@NgModule({
    imports: [
        FormsModule,
        CommonModule
    ],
    exports: [
        VirtualListComponent,
        VirtualListItem
    ],
    declarations: [
        VirtualListComponent,
        VirtualListItem
    ]
})
export class Module { }
