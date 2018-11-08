import { NgModule, Component, Input, Output, ViewChild, ViewChildren, forwardRef, ContentChildren, QueryList, OnInit, ElementRef, Renderer, OnDestroy, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Subscription } from 'rxjs/Subscription'

import { DynamicComponent } from './dynamic.component';
import { SectionHelper } from './section.helper';

@Component({
    selector: 'vtabs',
    template: `
        <div class="vtabs">
            <ul class="items">
                <li tabindex="0" #item class="hover-edit"  *ngFor="let tab of tabs; let i = index;" [ngClass]="{active: tab.active}" (keyup.space)="selectItem(i)" (keyup.enter)="selectItem(i)" (click)="selectItem(i)">
                    <i [class]="tab.ico"></i><span class="border-active">{{tab.name}}</span>
                </li>
            </ul>
            <div class="content">
                <ng-content></ng-content>
            </div>
        </div>
    `,
    styles: [`
        .content {
            min-width: 320px;
        }

        li:focus {
            /* Accessibility */
            outline-style: dashed;
            outline-color: #000;
            outline-width: 2px;
            outline-offset: -2px;
            text-decoration: underline;
        }
    `],
    host: {
        '(window:resize)': 'refresh()'
    }
})
export class VTabsComponent implements OnDestroy {
    @Input() markLocation: boolean;
    @Output() activate: EventEmitter<Item> = new EventEmitter();

    tabs: Item[];

    private _default: string;
    private _selectedIndex = -1;
    private _menuOn: boolean = false;
    private _tabsItems: Array<ElementRef>;
    private _hashCache: Array<string> = [];
    private _sectionHelper: SectionHelper;
    private _subscriptions: Array<Subscription> = [];
    @ViewChildren('item') private _tabList: QueryList<ElementRef>;
    @ContentChildren(forwardRef(() => Item)) its: QueryList<Item>;

    constructor(private _elem: ElementRef,
        private _renderer: Renderer,
        private _activatedRoute: ActivatedRoute,
        private _location: Location,
        private _router: Router) {

        this.tabs = [];
        this._default = this._activatedRoute.snapshot.params["section"];
    }

    public ngAfterViewInit() {
        this._sectionHelper = new SectionHelper(this.tabs.map(t => t.name), this._default, this.markLocation, this._location, this._activatedRoute, this._router);

        this._subscriptions.push(this._sectionHelper.active.subscribe(sec => this.onSectionChange(sec)));

        this._subscriptions.push(this.its.changes.subscribe(change => {
            let arr: Array<Item> = change.toArray();
            arr.forEach(item => {
                if (!this.tabs.find(t => t == item)) {
                    this.addTab(item);
                }
            });
        }));

        this._tabsItems = this._tabList.toArray();
        window.setTimeout(() => {
            this.refresh();
        }, 1);
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(sub => {
            (<any>sub).unsubscribe();
        });

        if (this._sectionHelper != null) {
            this._sectionHelper.dispose();
            this._sectionHelper = null;
        }
    }

    public addTab(tab: Item) {
        if (this._selectedIndex === -1 && (this.tabs.length === 0 && !this._default || SectionHelper.normalize(tab.name) == this._default)) {
            tab.activate();
            this._selectedIndex = this.tabs.length;
        }

        if (this._sectionHelper) {
            this._sectionHelper.addSection(tab.name);
        }

        this.tabs.push(tab);
    }

    public removeTab(tab: Item) {
        this._sectionHelper.removeSection(tab.name);

        let i = this.tabs.findIndex(item => item == tab);

        if (i != -1) {
            this.tabs.splice(i, 1);
        }
    }

    private selectItem(index: number) {
        let tab = this.tabs[index];

        if (!tab.routerLink) {
            this._sectionHelper.selectSection(tab.name);
        }
        else {
            tab.activate();
        }
    }

    private onSectionChange(section: string) {
        let index = this.tabs.findIndex(t => t.name === section);

        if (index == -1) {
            index = 0;
        }

        this.tabs.forEach(t => t.deactivate());
        this.tabs[index].activate();
        this._selectedIndex = index;
        this.refresh();
        this.activate.emit(this.tabs[index]);
    }

    private showMenu(show: boolean) {
        this._menuOn = (show == null) ? true : show;
    }

    private refresh() {
        if (!this._tabsItems || this._selectedIndex < 0) {
            return;
        }

        this.tabs.forEach(t => { t.visible = true });
    }
}

@Component({
    selector: 'vtabs > item',
    template: `
        <div *ngIf="!(!active)">
            <h1 class="border-active">{{name}}</h1>
            <ng-content></ng-content>
        </div>
    `,
    styles: [`
        h1 {
            margin: 0;
            padding: 0;
            margin-bottom: 30px;
            line-height: 34px;
            font-size: 18px;
            border-bottom-style: dotted;
            border-bottom-width: 1px;
        }
    `],
})
export class Item implements OnInit, OnDestroy {
    @Input() name: string;
    @Input() ico: string = "";
    @Input() visible: boolean = true;
    @Input() active: boolean;
    @Input() routerLink: Array<any>;

    @ContentChildren(DynamicComponent) dynamicChildren: QueryList<DynamicComponent>;

    constructor(private _tabs: VTabsComponent, private _router: Router) {
    }

    ngOnInit() {
        this._tabs.addTab(this);
    }

    activate() {
        if (this.dynamicChildren) {
            this.dynamicChildren.forEach(child => child.activate());
        }

        if (this.routerLink) {
            this._router.navigate(this.routerLink);
        }

        this.active = true;
    }

    deactivate() {
        if (this.dynamicChildren) {
            this.dynamicChildren.forEach(child => child.deactivate());
        }

        this.active = false;
    }

    ngOnDestroy() {
        if (this.dynamicChildren) {
            this.dynamicChildren.forEach(child => child.deactivate());
            this.dynamicChildren.forEach(child => child.destroy());
        }
        this._tabs.removeTab(this);
    }
}

export const TABS: any[] = [
    VTabsComponent,
    Item
];

@NgModule({
    imports: [
        FormsModule,
        CommonModule
    ],
    exports: [
        TABS
    ],
    declarations: [
        TABS
    ]
})
export class Module { }
