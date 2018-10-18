import { NgModule, Component, Input, Output, EventEmitter, ElementRef, OnInit, AfterViewInit , OnDestroy, ContentChildren, QueryList, Renderer } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { WindowService } from '../main/window.service';

@Component({
    selector: 'selector',
    template: `
        <div [hidden]="!opened || false" class="wrapper border-active background-normal shadow" [class.align-right]="right" [class.container-fluid]='_fluid' [class.stretch]='_stretch'>
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
            padding-top: 20px;
        }

        .wrapper.stretch,
        .wrapper.container-fluid {
            left:15px;
            right:15px;
        }

        .align-right {
            right: 0;
        }

        :host >>> ul {
            margin-bottom: 0;
        }

        :host >>> li > button,
        :host >>> li > .bttn {
            min-width: 125px;
            width: 100%;
        }

        :host.container-fluid {
            padding: 0;
        }
    `
    ],
    host: {
        '(document:click)': 'docClick($event)',
        '(click)': 'insideClick($event)'
    }
})
export class Selector implements OnInit, AfterViewInit, OnDestroy {
    private _subscriptions: Array<any> = [];

    @Input() right: boolean;
    @Input() public opened: boolean = false;

    @Output() hide: EventEmitter<any> = new EventEmitter();
    @Output() show: EventEmitter<any> = new EventEmitter();
    private _fluid: boolean;
    private _stretch: boolean;

    @ContentChildren('menuButton') _menuButtons: QueryList<ElementRef>;
    private _menuButtonDestructors: Array<Function> = [];
    private static _selectorId: number = 0;
    private _pending: boolean;
    private _id: number;

    constructor(private _elem: ElementRef,
        private _windowService: WindowService,
        private _renderer: Renderer) {
        this._fluid = this._elem.nativeElement.classList.contains('container-fluid');
        this._stretch = this._elem.nativeElement.classList.contains('stretch');
        this._id = Selector.getId();

        this._subscriptions.push(this.show.subscribe(e => {
            setTimeout(_ => _windowService.trigger(), 10);
        }));
    }

    public ngOnInit() {
        if (this.opened) {
            this._pending = true;
            setTimeout(() => this._pending = false, 10);
        }
    }

    public ngAfterViewInit() {
        this.subscribeToMenuButtons();
        this._subscriptions.push(this._menuButtons.changes.subscribe(buttons => {
            this.subscribeToMenuButtons();
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

    private subscribeToMenuButtons(): void {

        //
        // Setup subscriptions for menu buttons which should close the selector when clicked
        this._menuButtonDestructors.forEach(destructor => destructor());
        this._menuButtonDestructors.splice(0, this._menuButtonDestructors.length);

        if (this._menuButtons.toArray().length > 0) {
            this._menuButtons.forEach(menuButton => {
                this._menuButtonDestructors.push(this._renderer.listen(menuButton.nativeElement, 'click', () => {
                    this.close();
                }));
            })
        }
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
