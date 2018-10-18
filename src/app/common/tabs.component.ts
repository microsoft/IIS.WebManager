import { NgModule, Component, AfterViewInit, Input, Output, EventEmitter, Inject, Optional, ViewChild, ViewChildren, ContentChildren, QueryList, OnInit, ElementRef, Renderer, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Subscription } from 'rxjs/Subscription'

import { DynamicComponent } from './dynamic.component';
import { ComponentUtil } from '../utils/component';
import { SectionHelper } from './section.helper';

@Component({
    selector: 'tabs',
    styles: [`
        .tab-nav {
          position: relative;
          width: 100%;
          padding: 0;
          margin: 0;
          margin-bottom: 30px;
        }

        .tab-nav li {
          cursor: pointer;
          text-transform: Capitalize;
          font-size: 15px;
          font-family: 'Segoe UI';
        }

        .tabs {
          width: 100%;
          height: 28px;
          border-bottom-style: solid;
          border-bottom-width: 1px;
        }

        /* Same height as .tabs */
        .tabs-container {
          overflow: hidden;
          max-height: 28px;
        }

        .tabs ul {
          list-style: none;
          display: inline-block;
          padding:0;
          padding-top: 5px;
          margin:0;
          height: 28px;
        }

        .tabs li {
          display: inline;
          padding-top: 2px;
          padding-bottom: 2px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          padding-left: 5px;
          padding-right: 5px;
          border-style: solid;
          border-width: 1px;
        }

        .tabs li:not(.active) {
          border-color: transparent;
        }

        .tabs > ul > li:first-of-type {
          margin-left: 0;
        }

        .tabs li span {
            padding: 0;
            padding-bottom: 0;
        }

        .tabs li.active {
          border-style: solid;
          border-width: 1px;
          border-bottom-width: 2px;
          padding-bottom: 1px;
        }

        .hider {
          margin-left: 10px;
          margin-top: 0;
          z-index: 10;
          display: inline-block;
          width: 75px;
          float:right;
          position: relative;
          cursor: default;
          padding-left: 40px;
          padding-bottom: 27px;
          border-bottom: none;  
        }

        .menu-btn {
          display: inline-block;
          position: absolute;
          top: 1px;
          right: 0;
          cursor: pointer;
          z-index: 9;
          outline: none;
          height: 25px;
        }

        .menu-btn span {
            display: inline-block;
            padding: 3px 8px;
        }

        .menu {
          position: absolute;
          top: 28px;
          right:0;
          max-width: 300px;
          z-index: 11;
          border-style: solid;
          border-width: 1px;
        }

        .menu ul {
          list-style: none;
          margin: 0;
          padding:0;
        }

        .menu li {
          padding: 10px;
          margin: 0;
          min-width: 150px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }


        .tabs li.sticky {
          position: absolute;
          display: inline-flex;
          margin: 0;
          right: 27px;
          top: 1px;
        }

        .tabs li.sticky:before {
          content: '...';
          padding-left: 5px;
          padding-right: 20px;
        }
    `],
    template: `
        <div class="tab-nav">

            <div class="tabs-container">
                <div class='tabs border-active'>
                    <ul>
                        <li #item *ngFor="let tab of tabs; let i = index" class="border-active border-bottom-normal" [ngClass]="{active: tab.active}" (click)="selectTab(i)">
                            <span>{{tab.name}}</span>
                        </li>
                        <li *ngIf="_selectedIndex != -1" class="sticky background-normal border-active border-bottom-normal" [ngClass]="{active: !!'true', hidden: tabs[_selectedIndex].visible}" (click)="selectTab(_selectedIndex)">
                            <span class="border-active">{{tabs[_selectedIndex].name}}</span>
                        </li>
                    </ul>
                    <div class="hider background-normal"></div>
                </div>
            </div>

            <div class='menu-btn color-active background-normal' #menuBtn tabindex='0' (click)="showMenu(true)"><span class="border-active hover-active color-normal" [class.background-active]="_menuOn"><i class="fa fa-ellipsis-h"></i></span></div>
            <div class='menu border-active background-normal' [hidden]="!_menuOn">
                <ul>
                    <li *ngFor="let tab of tabs; let i = index;" class="hover-active" [ngClass]="{'background-active': tab.active}" (click)="selectTab(i)">{{tab.name}}</li>
                </ul>
            </div>
        </div>

        <ng-content></ng-content>
    `,
    host: {
        '(document:click)': 'dClick($event)',
        '(window:resize)': 'refresh()'
    }
})
export class TabsComponent implements OnDestroy, AfterViewInit {
    @Input() markLocation: boolean;

    tabs: TabComponent[];

    private _selectedIndex = -1;
    private _menuOn: boolean = false;
    private _default: string;
    private _tabsItems: Array<ElementRef>;
    private _hashCache: Array<string> = [];
    private _sectionHelper: SectionHelper;

    @ViewChild('menuBtn') menuBtn: ElementRef;
    @ViewChildren('item') tabList: QueryList<ElementRef>;

    private _subscriptions: Array<Subscription> = [];

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

        this._tabsItems = this.tabList.toArray();
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

    public addTab(tab: TabComponent) {
        //// If a tab hasn't already been set as the active
        //// We default to the first added tab if no section is specified
        //// Otherwise we look for the tab who's name matches the section
        //// We have to set the tab as the selected index when it is added to prevent changing state during the angular2 change detection lifecycle
        if (this._selectedIndex === -1 && (this.tabs.length === 0 && !this._default || SectionHelper.normalize(tab.name) == this._default)) {
            tab.activate();
            this._selectedIndex = this.tabs.length;
        }

        this.tabs.push(tab);
    }

    private selectTab(index: number) {
        this._sectionHelper.selectSection(this.tabs[index].name);
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
    }

    private showMenu(show: boolean) {
        this._menuOn = (show == null) ? true : show;
    }

    private dClick(evt) {
        if (!this._menuOn) {
            return;
        }

        var inside = ComponentUtil.isClickInsideComponent(evt, this.menuBtn);

        if (!inside) {
            this.showMenu(false);
        }
    }

    private blur() {
        this.showMenu(false);
    }

    private refresh() {
        if (!this._tabsItems || this._selectedIndex < 0) {
            return;
        }

        this.tabs.forEach(t => { t.visible = true });

        // Accessing native elements causes animations to play that trigger when ngModels are set from undefined to a truthy state
        let rect: ClientRect = this._tabsItems[this._selectedIndex].nativeElement.getBoundingClientRect();
        let rectBtn: ClientRect = this.menuBtn.nativeElement.getBoundingClientRect();
        let diff: number = rectBtn.left - rect.right - 10;

        if (diff < 0) {
            this.tabs[this._selectedIndex].visible = false;
        }
    }
}

@Component({
    selector: 'tab',
    template: `
        <div *ngIf="!(!active)">
            <ng-content></ng-content>
        </div>
    `
})
export class TabComponent implements OnInit, OnDestroy {
    @Input() name: string;
    @Input() visible: boolean = true;
    @Input() active: boolean;

    @ContentChildren(DynamicComponent) dynamicChildren: QueryList<DynamicComponent>;

    constructor(private _tabs: TabsComponent) {
    }

    public ngOnInit() {
        this._tabs.addTab(this);
    }

    public activate() {
        if (this.dynamicChildren) {
            this.dynamicChildren.forEach(child => child.activate());
        }

        this.active = true;
    }

    public deactivate() {
        if (this.dynamicChildren) {
            this.dynamicChildren.forEach(child => child.deactivate());
        }

        this.active = false;
    }

    public ngOnDestroy() {
        if (this.dynamicChildren) {
            this.dynamicChildren.forEach(child => child.deactivate());
            this.dynamicChildren.forEach(child => child.destroy());
        }
    }
}

export const TABS: any[] = [
    TabsComponent,
    TabComponent
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
