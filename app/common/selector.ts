import { NgModule, Component, Input, Output, EventEmitter, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { WindowService } from '../main/window.service';

@Component({
    selector: 'selector',
    template: `
        <div [hidden]="!opened || false" class="wrapper border-active background-normal shadow" [class.align-right]="right" [class.container-fluid] = '_fluid'>
            <ng-content></ng-content>
        </div>
    `,
    styles: [`
        .wrapper {
            position:absolute;
            z-index: 100;
            margin-bottom: 20px;
            border-width:1px; 
            border-style:solid;
        }

        .wrapper.container-fluid {
            left:15px;
            right:15px;
            padding-top: 20px;
        }

        .align-right {
            right: 0;
        }
    `
    ],
    host: {
        '(document:click)': 'docClick($event)',
        '(click)': 'insideClick($event)'
    }
})
export class Selector implements OnDestroy {
    private _subscriptions: Array<any> = [];

    @Input() right: boolean;

    @Output() hide: EventEmitter<any> = new EventEmitter();
    @Output() show: EventEmitter<any> = new EventEmitter();

    private static _selectorId: number = 0;

    opened: boolean = false;

    private _fluid: boolean;
    private _pending: boolean;
    private _id: number;

    constructor(private _elem: ElementRef,
                private _windowService: WindowService) {
        this._fluid = this._elem.nativeElement.classList.contains('container-fluid');
        this._id = Selector.getId();

        this._subscriptions.push(this.show.subscribe(e => {
            setTimeout(_ => _windowService.trigger(), 10);
        }));
    }

    toggle() {
        if (this.opened) {
            this.close();
        }
        else {
            this.open();
        }
    }

    open() {
        this._pending = true;
        this.opened = true;
        this._windowService.trigger();

        setTimeout(() => {
            this._pending = false;
            this.show.emit(null);
        }, 10);

    }

    close() {
        this._pending = true;
        this.opened = false;

        setTimeout(() => {
            this._pending = false;
            this.hide.emit(null);
        }, 10);
    }

    isOpen() {
        return this.opened;
    }

    public ngOnDestroy() {
        for (let sub of this._subscriptions) {
            sub.unsubscribe();
        }
    }

    private static getId(): number {
        let n = Selector._selectorId;
        Selector._selectorId = Selector._selectorId + 1 % 4192;
        return n;
    }

    private docClick(evt: Event) {
        if (!this.opened || this._pending) {
            return;
        }

        let e = <any>evt;
        if (!e._selectors || !e._selectors[this._id]) {
            this.close();
        }
    }

    private insideClick(evt: Event) {
        let e = <any>evt;
        if (!e._selectors) {
            e._selectors = [];
        }
        e._selectors[this._id] = true;
    }
}

@NgModule({
    imports: [
        FormsModule,
        CommonModule
    ],
    exports: [
        Selector
    ],
    declarations: [
        Selector
    ]
})
export class Module { }
