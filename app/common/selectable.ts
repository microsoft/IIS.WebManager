import { NgModule, Directive, Injectable, ElementRef, Input, ContentChildren, QueryList, OnInit, Renderer, Optional, OnDestroy, OnChanges, SimpleChange, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Injectable()
class SelectableService {
    private _selected: Array<any>;
    private _selectable: Array<any>;
    private _active: boolean;

    private _multiSelect: boolean = false;

    public initialize(selected: Array<any>, selectable: Array<any>) {
        this._selected = selected;
        this._selectable = selectable;
    }

    public select(target: any, multi: boolean = false, cascade: boolean) {
        if (!multi && !cascade) {
            this.clearSelection();
        }

        if (cascade) {
            let start = this._selectable.findIndex(f => f === (this._selected.length > 0 ? this._selected[0] : null));

            this.clearSelection();
            this._selected.push(this._selectable[start]);

            if (start != -1) {
                let currentIndex = this._selectable.findIndex(t => t === target);

                let min = Math.min(start, currentIndex);
                let max = Math.max(start, currentIndex);

                for (let i = min; i <= max && i < this._selectable.length; i++) {
                    this.select(this._selectable[i], true, false);
                }
            }
        }

        if (!this._selected.find(f => f === target)) {
            this._selected.push(target);
        }
    }

    public clearSelection(target: any = null) {
        if (target) {
            let index = this._selected.findIndex(f => f === target);
            if (index != -1) {
                this._selected.splice(index, 1);
            }
        }
        else {
            this._selected.splice(0);
        }

        this._active = null;
    }

    public isSelected(target: any) {
        return this._selected.findIndex(t => t === target) != -1;
    }

    public selectAll(event: Event) {
        event.preventDefault();
        this._selected.splice(0, this._selected.length);
        this._selectable.forEach(item => this._selected.push(item));
    }
}


@Directive({
    selector: 'li',
    host: {
        '[class.background-selected]': "isSelected()"
    }
})
export class ItemMarker {
    private _model: any;
    private _active = null;

    constructor(public host: ElementRef,
                @Optional() private _svc: SelectableService) {
    }

    public setModel(model: any) {
        this._model = model;
    }

    private isSelected(): boolean {
        if (!this._svc) {
            return false;
        }

        return this._svc.isSelected(this._model);
    }
}


@Directive({
    selector: '[model]'
})
export class SelectableListItem implements OnInit, OnDestroy {
    @Input() public model: any;

    private _tearDown: Function;

    constructor(private _host: ElementRef,
                private _renderer: Renderer,
                @Optional() private _listItem: ItemMarker,
                @Optional() private _svc: SelectableService) {

        if (this._svc) {
            this._tearDown = this._renderer.listen(this._host.nativeElement, 'click', (evt) => this.onSelect(evt));
        }
    }

    public ngOnInit() {
        this.setModel(this.model);
    }

    public ngOnChanges(changes: { [key: string]: SimpleChange; }): any {
        if (changes["model"]) {
            this.setModel(changes["model"].currentValue);
        }
    }

    public ngOnDestroy() {
        if (this._tearDown) {
            this._tearDown();
        }
    }

    private setModel(model: any) {
        if (this._listItem) {
            this._listItem.setModel(model);
        }
    }

    private onSelect(e: MouseEvent) {
        if (e.defaultPrevented || !this._svc) {
            return;
        }

        if (e.ctrlKey && this._svc.isSelected(this.model)) {
            this._svc.clearSelection(this.model);
        }
        else {
            this._svc.select(this.model, e.ctrlKey, e.shiftKey);
        }
    }
}

@Directive({
    selector: '[selectable]',
    host: {
        '(keydown.shift)': "_multiSelect=true",
        '(keyup.shift)': "_multiSelect=false",
        '(keydown.control.a)': "selectAll($event)",
        '[attr.tabindex]': "-1",
        '[class.noselect]': "_multiSelect",
        '(blur)': 'onBlur($event)'
    },
    providers: [
        SelectableService
    ]
})
export class Selectable implements OnInit {
    @Input() selected: Array<any>;
    @Input() selectable: Array<any>;

    private _multiSelect: boolean;

    constructor(private _svc: SelectableService,
                private _eRef: ElementRef,
                private _renderer: Renderer,
                private _changeDetectorRef: ChangeDetectorRef) {
    }

    public ngOnInit() {
        this._svc.initialize(this.selected, this.selectable);
    }

    public ngOnChanges(changes: { [key: string]: SimpleChange; }): any {
        if (changes["selected"] || changes["selectable"]) {
            let selected = changes["selected"] ? changes["selected"].currentValue : this.selected;
            let selectable = changes["selectable"] ? changes["selectable"].currentValue : this.selectable;

            this._svc.initialize(selected, selectable);
        }
    }

    public select(target: any, multi: boolean = false, cascade: boolean) {
        this._svc.select(target, multi, cascade);
    }

    private selectAll(event: Event) {
        this._svc.selectAll(event);
        this._changeDetectorRef.markForCheck();
    }

    private onBlur(evt: Event) {
        this._svc.clearSelection();
    }
}

@NgModule({
    imports: [
        FormsModule,
        CommonModule
    ],
    exports: [
        Selectable,
        SelectableListItem,
        ItemMarker
    ],
    declarations: [
        Selectable,
        SelectableListItem,
        ItemMarker
    ]
})
export class Module { }
