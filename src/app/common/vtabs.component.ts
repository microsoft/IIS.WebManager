import { NgModule, Component, Input, Output, ContentChildren, QueryList, OnInit, OnDestroy, EventEmitter, AfterViewInit, ElementRef, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, Subject, ReplaySubject } from 'rxjs';
import { DynamicComponent } from './dynamic.component';
import { SectionHelper } from './section.helper';
import { Module as DynamicModule } from './dynamic.component';
import { FeatureVTabsComponent } from './feature-vtabs.component';
import { LoggerFactory, Logger, LogLevel } from 'diagnostics/logger';
import { IsWAC } from 'environments/environment';

@Component({
    selector: 'vtabs',
    // In WAC mode, we can select feature when input-focus is changed.
    // In the site mode, we can't select the feature when input-focus is change.
    // That is because users are allowed to use only tab key, not arrow keys, unlike the WAC mode.
    template: `
        <div class="vtabs">
            <ul class="items sme-focus-zone">
                <ng-container *ngFor="let category of getCategories()">
                    <div class="sme-focus-zone">
                        <li tabindex="0" *ngIf="!!category" class="separator">
                            <div class="horizontal-strike">
                                <span>{{category}}</span>
                            </div>
                        </li>
                        <li *ngFor="let tab of getTabs(category)"
                            tabindex="0"
                            #tabLabels
                            class="hover-edit"
                            [ngClass]="{active: tab.active}"
                            (keyup.space)="selectItem(tab)"
                            (keyup.enter)="selectItem(tab)"
                            (focus)=" isWAC() ? selectItem(tab) : '' "
                            (click)="selectItem(tab)">
                            <i [class]="tab.ico"></i>
                            <span class="border-active">{{tab.name}}</span>
                        </li>
                    </div>
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
    private _sectionHelper: SectionHelper;
    private _subscriptions: Array<Subscription> = [];
    private logger: Logger;
    categorizedTabs: Map<string, Item[]> = new Map<string, Item[]>();

    @ViewChildren('tabLabels') tabLabels: QueryList<ElementRef>;
    onSelectItem: Subject<string> = new ReplaySubject<string>();

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _location: Location,
        private _router: Router,
        private factory: LoggerFactory,
    ) {
        this.tabs = [];
        this.logger = factory.Create(this);
    }

    public ngAfterViewInit() {
        let selectedPath: string = this._activatedRoute.snapshot.params["section"];
        if (!selectedPath && this.defaultTab) {
            selectedPath = SectionHelper.normalize(this.defaultTab);
        }
        if (selectedPath) {
            if (!selectedPath.includes("+")) {
                // if input is not fully qualified, resolve category by searching
                this.logger.log(LogLevel.INFO, `Tab ID ${selectedPath} is not fully qualified, trying to resolve category`);
                for (let i = this.categories.length - 1; i >= 0; i--) {
                    let item = this.categorizedTabs[SectionHelper.normalize(this.categories[i])].find(i => SectionHelper.normalize(i.name) == selectedPath);
                    if (item) {
                        selectedPath = Item.Join(this.categories[i], selectedPath);
                        break;
                    }
                }
            }
        } else {
            if (this.categories) {
                let category = SectionHelper.normalize(this.categories.last());
                selectedPath = this.categorizedTabs[category][0].fullName;
            } else {
                selectedPath = this.categorizedTabs.values[0].fullName;
            }
        }
        this.logger.log(LogLevel.DEBUG, `Default tab selected ${selectedPath}`);
        this._sectionHelper = new SectionHelper(this.tabs.map(t => t.fullName), selectedPath, this.markLocation, this._location, this._router);
        this._subscriptions.push(this._sectionHelper.active.subscribe(sec => this.onSectionChange(sec)));
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(sub => {
            (<any>sub).unsubscribe();
        });

        if (this._sectionHelper != null) {
            this._sectionHelper.dispose();
            this._sectionHelper = null;
        }
        this.onSelectItem.unsubscribe();
    }

    public addTab(tab: Item) {
        const category = SectionHelper.normalize(tab.category || "");
        if (!this.categorizedTabs[category]) {
            this.categorizedTabs[category] = [];
        }
        this.categorizedTabs[category].push(tab);
        if (this._sectionHelper) {
            this._sectionHelper.addSection(tab.fullName);
        }
        this.tabs.push(tab);
    }

    public removeTab(tab: Item) {
        this._sectionHelper.removeSection(tab.fullName);

        let i = this.tabs.findIndex(item => item == tab);

        if (i != -1) {
            this.tabs.splice(i, 1);
        }
    }

    public getCategories() {
        return this.categories || this.categorizedTabs.keys();
    }

    public getTabs(category: string) {
        return this.categorizedTabs[SectionHelper.normalize(category)];
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
            this._sectionHelper.selectSection(tab.fullName);
        }
        else {
            tab.activate();
        }
    }

    private onSectionChange(section: string) {
        let index = this.tabs.findIndex(t => t.fullName === section);

        if (index == -1) {
            index = 0;
        }

        this.tabs.forEach(t => t.deactivate());
        this.tabs[index].activate();
        this.activate.emit(this.tabs[index]);
        this.onSelectItem.next(section);
    }

    private isWAC() {
        return IsWAC;
    }
}

@Component({
    selector: '[vtabs item][vtabs ng-container item]',
    template: `
        <div *ngIf="!(!active)">
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

    static Join(category: string, name: string) {
        return `${SectionHelper.normalize(category)}+${SectionHelper.normalize(name)}`;
    }

    static GetFullyQualifiedName(item: Item) {
        return Item.Join(item.category, item.name);
    }

    @Input() ico: string = "";
    @Input() active: boolean;
    @Input() routerLink: Array<any>;
    @Input() category: string = "";
    @Input() name: string;
    private _fullName: string;

    @ContentChildren(DynamicComponent) dynamicChildren: QueryList<DynamicComponent>;

    private logger: Logger;

    constructor(
        private _tabs: VTabsComponent,
        private _router: Router,
        private factory: LoggerFactory,
    ){
        this.logger = factory.Create(this);
    }

    ngOnInit() {
        this._tabs.addTab(this);
    }

    get fullName() {
        return this._fullName || (this._fullName = Item.GetFullyQualifiedName(this));
    }

    activate() {
        if (this.dynamicChildren) {
            this.dynamicChildren.forEach(child => child.activate());
        }

        if (this.routerLink) {
            return this._router.navigate(this.routerLink, {
                skipLocationChange: true,
                replaceUrl: true,
            });
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
    FeatureVTabsComponent,
    VTabsComponent,
    Item,
];

@NgModule({
    imports: [
        RouterModule,
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
