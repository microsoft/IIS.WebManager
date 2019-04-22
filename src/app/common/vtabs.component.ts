import { NgModule, Component, Input, Output, ContentChildren, QueryList, OnInit, OnDestroy, EventEmitter, AfterViewInit, ElementRef, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs'
import { DynamicComponent } from './dynamic.component';
import { SectionHelper } from './section.helper';
import { IsWAC } from 'environments/environment'
import { Module as DynamicModule } from './dynamic.component'
import { FeatureVTabsComponent } from './feature-vtabs.component';

@Component({
    selector: 'vtabs',
    template: `
        <div class="vtabs">
            <ul class="items sme-focus-zone">
                <ng-container *ngFor="let category of getCategories()">
                    <li *ngIf="!!category" class="separator"><div class="horizontal-strike"><span>{{category}}</span></div></li>
                    <li tabindex="0"
                        #tabLabels
                        class="hover-edit"
                        *ngFor="let tab of getTabs(category)"
                        [ngClass]="{active: tab.active}"
                        (keyup.space)="selectItem(tab)"
                        (keyup.enter)="selectItem(tab)"
                        (click)="selectItem(tab)">
                        <i [class]="tab.ico"></i><span class="border-active">{{tab.name}}</span>
                    </li>
                </ng-container>
            </ul>
            <div class="content sme-focus-zone">
                <ng-content></ng-content>
            </div>
        </div>
    `,
    styles: [`
        .content {
            min-width: 320px;
        }

        li:focus {
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
export class VTabsComponent implements OnDestroy, AfterViewInit {
    @Input() markLocation: boolean;
    @Input() defaultTab: string;
    @Output() activate: EventEmitter<Item> = new EventEmitter();
    @Input() categories: string[];

    private tabs: Item[];
    private _default: string;
    private _selectedIndex = -1;
    private _sectionHelper: SectionHelper;
    private _subscriptions: Array<Subscription> = [];
    categorizedTabs: Map<string, Item[]> = new Map<string, Item[]>();

    @ViewChildren('tabLabels') tabLabels: QueryList<ElementRef>;

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _location: Location,
        private _router: Router,
    ) {
        this.tabs = [];
    }

    public ngAfterViewInit() {
        this._default = this._activatedRoute.snapshot.params["section"] || this.defaultTab;
        this._sectionHelper = new SectionHelper(this.tabs.map(t => t.name), this._default, this.markLocation, this._location, this._router);
        this._subscriptions.push(this._sectionHelper.active.subscribe(sec => this.onSectionChange(sec)));
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
        const category = tab.category || "";
        if (!this.categorizedTabs[category]) {
            this.categorizedTabs[category] = [];
        }
        this.categorizedTabs[category].push(tab);
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

    public getCategories() {
        return this.categories || this.categorizedTabs.keys();
    }

    public getTabs(category: string) {
        return this.categorizedTabs[category];
    }

    public hide(tabName: string) {
        this.tabLabels.forEach((elementRef, _, __) => {
            if (elementRef.nativeElement.innerText == tabName) {
                elementRef.nativeElement.remove();
            }
        })
    }

    selectItem(tab: Item) {
        if (!tab.routerLink) {
            this._sectionHelper.selectSection(tab.name);
        }
        else {
            tab.activate();
        }
        // set input focus to the title element of the newly activated tab
        tab.focusTitle();
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

    private refresh() {
        if (this.tabs && this._selectedIndex < 0) {
            this.tabs.forEach(t => { t.visible = true });
        }
    }
}

@Component({
    selector: 'vtabs > item',
    template: `
        <div *ngIf="!(!active)">
            <span id="vtabs-title" [tabindex]="isWAC() ? -1 : 0"></span>
            <h1 class="border-active">
                <span>{{name}}</span>
            </h1>
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

        span:focus {
            outline-style: dashed;
            outline-color: #000;
            outline-width: 2px;
            outline-offset: -2px;
            text-decoration: underline;
        }
    `],
})
export class Item implements OnInit, OnDestroy {
    @Input() category: string
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

    private isWAC() {
        return IsWAC;
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

    focusTitle() {
        setTimeout(()=>document.getElementById("vtabs-title").focus());
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
    FeatureVTabsComponent,
    VTabsComponent,
    Item,
];

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        DynamicModule,
    ],
    exports: [
        TABS
    ],
    declarations: [
        TABS
    ]
})
export class Module { }
