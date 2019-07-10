import {
    AfterViewInit,
    Component,
    ContentChildren,
    ElementRef,
    EventEmitter,
    Input,
    NgModule,
    OnDestroy,
    OnInit,
    Output,
    QueryList,
    ViewChildren,
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { OptionsService } from "main/options.service";
import { FormsModule } from '@angular/forms';
import { Subscription, Subject, ReplaySubject } from 'rxjs';
import { DynamicComponent } from './dynamic.component';
import { SectionHelper } from './section.helper';
import { Module as DynamicModule } from './dynamic.component';
import { FeatureVTabsComponent } from './feature-vtabs.component';
import { LoggerFactory, Logger, LogLevel } from 'diagnostics/logger';
import { TitlesModule } from 'header/titles.module';
import { Heading } from 'header/feature-header.component';
import { TitlesService } from 'header/titles.service';

@Component({
    selector: 'vtabs',
    // In WAC mode, we can select feature when input-focus is changed.
    // In the site mode, we can't select the feature when input-focus is change.
    // That is because users are allowed to use only tab key, not arrow keys, unlike the WAC mode.
    template: `
<div class="vtabs">
    <ul class="items sme-focus-zone">
        <div *ngIf="header" class="vtab-header items">{{header}}</div>
        <ng-container *ngFor="let category of getCategories()">
            <ng-container *ngIf="!IsHidden(category)">
                <li *ngIf="category" class="separator">
                    <div class="horizontal-strike"><span class="category">{{category}}</span></div>
                </li>
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
        </ng-container>
    </ul>
</div>
<div class="content sme-focus-zone" [class.nav-hidden]="!isActive">
    <ng-content></ng-content>
</div>
`,
    styles: [`
.content {
    min-width: 320px;
    height: 100vh;
}

.nav-hidden {
    padding-left:12px;
}

li:focus {
    outline-style: dashed;
    outline-color: #000;
    outline-width: 2px;
    outline-offset: -2px;
    text-decoration: underline;
}

.vtab-header {
    display: block;
    font-size: 18px;
    font-weight: bold;
    margin-left: 1em;
    margin-top: 0.5em;
    margin-bottom: 0.5em;
    padding-bottom: 0;
}

.vtabs {
    width: 200px;
    position: sticky;
    float: left;
    height: 100vh;
}

.category {
    color: #000;
}
`],
    host: {
        '(window:resize)': 'refresh()'
    }
})
export class VTabsComponent implements OnDestroy, AfterViewInit {
    @Input() header: string;
    @Input() markLocation: boolean;
    @Input() defaultTab: string;
    @Output() activate: EventEmitter<Item> = new EventEmitter();
    @Input() categories: string[] = [ '' ];

    private tabs: Item[];
    private _sectionHelper: SectionHelper;
    private _subscriptions: Array<Subscription> = [];
    private logger: Logger;
    private hiddenCategories: Set<string> = new Set<string>();
    categorizedTabs: Map<string, Item[]> = new Map<string, Item[]>();
    onSelectItem: Subject<Item> = new ReplaySubject<Item>(1);

    @ViewChildren('tabLabels') tabLabels: QueryList<ElementRef>;

    constructor(
        private _titles: TitlesService,
        private _activatedRoute: ActivatedRoute,
        private _location: Location,
        private _router: Router,
        private options: OptionsService,
        factory: LoggerFactory,
    ) {
        this.tabs = [];
        this.logger = factory.Create(this);
    }

    get isActive() {
        return this.options.active;
    }

    refresh() {
        this.options.refresh();
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
        this._titles.sections = this._sectionHelper;
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

    public IsHidden(category: string) {
        return this.hiddenCategories.has(category);
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

    public showCategory(name: string, show: boolean) {
        if (show) {
            this.hiddenCategories.delete(name);
        } else {
            this.hiddenCategories.add(name);
        }
    }

    public selectItem(tab: Item) {
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
        let selectedTab = this.tabs[index];
        selectedTab.activate();
        this.activate.emit(selectedTab);
        this.onSelectItem.next(selectedTab);
    }
}

@Component({
    selector: '[vtabs item][vtabs ng-container item]',
    template: `
<div class="content-wrapper" *ngIf="active">
    <titles></titles>
    <div class="vtab-content">
        <ng-content></ng-content>
    </div>
</div>
    `,
    styles: [`
span:focus {
    outline-style: dashed;
    outline-color: #000;
    outline-width: 2px;
    outline-offset: -2px;
    text-decoration: underline;
}

.vtab-content {
    padding-left: 20px;
}

.content-wrapper {
    margin: -1px;
    border-left: 1px solid #ccc;
}

    `],
})
export class Item implements OnInit, OnDestroy, Heading {

    static Join(category: string, name: string) {
        return `${SectionHelper.normalize(category)}+${SectionHelper.normalize(name)}`;
    }

    static GetFullyQualifiedName(item: Item) {
        return Item.Join(item.category, item.name);
    }

    @Input() ico: string = "";
    @Input() routerLink: Array<any>;
    @Input() category: string = "";
    @Input() name: string;
    active: boolean;
    private _fullName: string;

    @ContentChildren(DynamicComponent) dynamicChildren: QueryList<DynamicComponent>;

    constructor(
        private _tabs: VTabsComponent,
        private _router: Router,
    ){}

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
        TitlesModule,
    ],
    exports: [
        TABS,
    ],
    declarations: [
        TABS,
    ]
})
export class Module { }
