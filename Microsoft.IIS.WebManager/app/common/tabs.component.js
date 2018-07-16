"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var common_1 = require("@angular/common");
var forms_1 = require("@angular/forms");
var dynamic_component_1 = require("./dynamic.component");
var component_1 = require("../utils/component");
var section_helper_1 = require("./section.helper");
var TabsComponent = /** @class */ (function () {
    function TabsComponent(_elem, _renderer, _activatedRoute, _location, _router) {
        this._elem = _elem;
        this._renderer = _renderer;
        this._activatedRoute = _activatedRoute;
        this._location = _location;
        this._router = _router;
        this._selectedIndex = -1;
        this._menuOn = false;
        this._hashCache = [];
        this._subscriptions = [];
        this.tabs = [];
        this._default = this._activatedRoute.snapshot.params["section"];
    }
    TabsComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        this._sectionHelper = new section_helper_1.SectionHelper(this.tabs.map(function (t) { return t.name; }), this._default, this.markLocation, this._location, this._activatedRoute, this._router);
        this._subscriptions.push(this._sectionHelper.active.subscribe(function (sec) { return _this.onSectionChange(sec); }));
        this._tabsItems = this.tabList.toArray();
        window.setTimeout(function () {
            _this.refresh();
        }, 1);
    };
    TabsComponent.prototype.ngOnDestroy = function () {
        this._subscriptions.forEach(function (sub) {
            sub.unsubscribe();
        });
        if (this._sectionHelper != null) {
            this._sectionHelper.dispose();
            this._sectionHelper = null;
        }
    };
    TabsComponent.prototype.addTab = function (tab) {
        //// If a tab hasn't already been set as the active
        //// We default to the first added tab if no section is specified
        //// Otherwise we look for the tab who's name matches the section
        //// We have to set the tab as the selected index when it is added to prevent changing state during the angular2 change detection lifecycle
        if (this._selectedIndex === -1 && (this.tabs.length === 0 && !this._default || section_helper_1.SectionHelper.normalize(tab.name) == this._default)) {
            tab.activate();
            this._selectedIndex = this.tabs.length;
        }
        this.tabs.push(tab);
    };
    TabsComponent.prototype.selectTab = function (index) {
        this._sectionHelper.selectSection(this.tabs[index].name);
    };
    TabsComponent.prototype.onSectionChange = function (section) {
        var index = this.tabs.findIndex(function (t) { return t.name === section; });
        if (index == -1) {
            index = 0;
        }
        this.tabs.forEach(function (t) { return t.deactivate(); });
        this.tabs[index].activate();
        this._selectedIndex = index;
        this.refresh();
    };
    TabsComponent.prototype.showMenu = function (show) {
        this._menuOn = (show == null) ? true : show;
    };
    TabsComponent.prototype.dClick = function (evt) {
        if (!this._menuOn) {
            return;
        }
        var inside = component_1.ComponentUtil.isClickInsideComponent(evt, this.menuBtn);
        if (!inside) {
            this.showMenu(false);
        }
    };
    TabsComponent.prototype.blur = function () {
        this.showMenu(false);
    };
    TabsComponent.prototype.refresh = function () {
        if (!this._tabsItems || this._selectedIndex < 0) {
            return;
        }
        this.tabs.forEach(function (t) { t.visible = true; });
        // Accessing native elements causes animations to play that trigger when ngModels are set from undefined to a truthy state
        var rect = this._tabsItems[this._selectedIndex].nativeElement.getBoundingClientRect();
        var rectBtn = this.menuBtn.nativeElement.getBoundingClientRect();
        var diff = rectBtn.left - rect.right - 10;
        if (diff < 0) {
            this.tabs[this._selectedIndex].visible = false;
        }
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], TabsComponent.prototype, "markLocation", void 0);
    __decorate([
        core_1.ViewChild('menuBtn'),
        __metadata("design:type", core_1.ElementRef)
    ], TabsComponent.prototype, "menuBtn", void 0);
    __decorate([
        core_1.ViewChildren('item'),
        __metadata("design:type", core_1.QueryList)
    ], TabsComponent.prototype, "tabList", void 0);
    TabsComponent = __decorate([
        core_1.Component({
            selector: 'tabs',
            styles: ["\n        .tab-nav {\n          position: relative;\n          width: 100%;\n          padding: 0;\n          margin: 0;\n          margin-bottom: 30px;\n        }\n\n        .tab-nav li {\n          cursor: pointer;\n          text-transform: Capitalize;\n          font-size: 15px;\n          font-family: 'Segoe UI';\n        }\n\n        .tabs {\n          width: 100%;\n          height: 28px;\n          border-bottom-style: solid;\n          border-bottom-width: 1px;\n        }\n\n        /* Same height as .tabs */\n        .tabs-container {\n          overflow: hidden;\n          max-height: 28px;\n        }\n\n        .tabs ul {\n          list-style: none;\n          display: inline-block;\n          padding:0;\n          padding-top: 5px;\n          margin:0;\n          height: 28px;\n        }\n\n        .tabs li {\n          display: inline;\n          padding-top: 2px;\n          padding-bottom: 2px;\n          overflow: hidden;\n          text-overflow: ellipsis;\n          white-space: nowrap;\n          padding-left: 5px;\n          padding-right: 5px;\n          border-style: solid;\n          border-width: 1px;\n        }\n\n        .tabs li:not(.active) {\n          border-color: transparent;\n        }\n\n        .tabs > ul > li:first-of-type {\n          margin-left: 0;\n        }\n\n        .tabs li span {\n            padding: 0;\n            padding-bottom: 0;\n        }\n\n        .tabs li.active {\n          border-style: solid;\n          border-width: 1px;\n          border-bottom-width: 2px;\n          padding-bottom: 1px;\n        }\n\n        .hider {\n          margin-left: 10px;\n          margin-top: 0;\n          z-index: 10;\n          display: inline-block;\n          width: 75px;\n          float:right;\n          position: relative;\n          cursor: default;\n          padding-left: 40px;\n          padding-bottom: 27px;\n          border-bottom: none;  \n        }\n\n        .menu-btn {\n          display: inline-block;\n          position: absolute;\n          top: 1px;\n          right: 0;\n          cursor: pointer;\n          z-index: 9;\n          outline: none;\n          height: 25px;\n        }\n\n        .menu-btn span {\n            display: inline-block;\n            padding: 3px 8px;\n        }\n\n        .menu {\n          position: absolute;\n          top: 28px;\n          right:0;\n          max-width: 300px;\n          z-index: 11;\n          border-style: solid;\n          border-width: 1px;\n        }\n\n        .menu ul {\n          list-style: none;\n          margin: 0;\n          padding:0;\n        }\n\n        .menu li {\n          padding: 10px;\n          margin: 0;\n          min-width: 150px;\n          white-space: nowrap;\n          overflow: hidden;\n          text-overflow: ellipsis;\n        }\n\n\n        .tabs li.sticky {\n          position: absolute;\n          display: inline-flex;\n          margin: 0;\n          right: 27px;\n          top: 1px;\n        }\n\n        .tabs li.sticky:before {\n          content: '...';\n          padding-left: 5px;\n          padding-right: 20px;\n        }\n    "],
            template: "\n        <div class=\"tab-nav\">\n\n            <div class=\"tabs-container\">\n                <div class='tabs border-active'>\n                    <ul>\n                        <li #item *ngFor=\"let tab of tabs; let i = index;\" class=\"border-active border-bottom-normal\" [ngClass]=\"{active: tab.active}\" (click)=\"selectTab(i)\">\n                            <span>{{tab.name}}</span>\n                        </li>\n                        <li *ngIf=\"_selectedIndex != -1\" class=\"sticky background-normal border-active border-bottom-normal\" [ngClass]=\"{active: !!'true', hidden: tabs[_selectedIndex].visible}\" (click)=\"selectTab(_selectedIndex)\">\n                            <span class=\"border-active\">{{tabs[_selectedIndex].name}}</span>\n                        </li>\n                    </ul>\n                    <div class=\"hider background-normal\"></div>\n                </div>\n            </div>\n\n            <div class='menu-btn color-active background-normal' #menuBtn tabindex='0' (click)=\"showMenu()\"><span class=\"border-active hover-active color-normal\" [class.background-active]=\"_menuOn\"><i class=\"fa fa-ellipsis-h\"></i></span></div>\n            <div class='menu border-active background-normal' [hidden]=\"!_menuOn\">\n                <ul>\n                    <li *ngFor=\"let tab of tabs; let i = index;\" class=\"hover-active\" [ngClass]=\"{'background-active': tab.active}\" (click)=\"selectTab(i)\">{{tab.name}}</li>\n                </ul>\n            </div>\n        </div>\n\n        <ng-content></ng-content>\n    ",
            host: {
                '(document:click)': 'dClick($event)',
                '(window:resize)': 'refresh()'
            }
        }),
        __metadata("design:paramtypes", [core_1.ElementRef,
            core_1.Renderer,
            router_1.ActivatedRoute,
            common_1.Location,
            router_1.Router])
    ], TabsComponent);
    return TabsComponent;
}());
exports.TabsComponent = TabsComponent;
var TabComponent = /** @class */ (function () {
    function TabComponent(_tabs) {
        this._tabs = _tabs;
        this.visible = true;
    }
    TabComponent.prototype.ngOnInit = function () {
        this._tabs.addTab(this);
    };
    TabComponent.prototype.activate = function () {
        if (this.dynamicChildren) {
            this.dynamicChildren.forEach(function (child) { return child.activate(); });
        }
        this.active = true;
    };
    TabComponent.prototype.deactivate = function () {
        if (this.dynamicChildren) {
            this.dynamicChildren.forEach(function (child) { return child.deactivate(); });
        }
        this.active = false;
    };
    TabComponent.prototype.ngOnDestroy = function () {
        if (this.dynamicChildren) {
            this.dynamicChildren.forEach(function (child) { return child.deactivate(); });
            this.dynamicChildren.forEach(function (child) { return child.destroy(); });
        }
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], TabComponent.prototype, "name", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], TabComponent.prototype, "visible", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], TabComponent.prototype, "active", void 0);
    __decorate([
        core_1.ContentChildren(dynamic_component_1.DynamicComponent),
        __metadata("design:type", core_1.QueryList)
    ], TabComponent.prototype, "dynamicChildren", void 0);
    TabComponent = __decorate([
        core_1.Component({
            selector: 'tab',
            template: "\n        <div *ngIf=\"!(!active)\">\n            <ng-content></ng-content>\n        </div>\n    "
        }),
        __metadata("design:paramtypes", [TabsComponent])
    ], TabComponent);
    return TabComponent;
}());
exports.TabComponent = TabComponent;
exports.TABS = [
    TabsComponent,
    TabComponent
];
var Module = /** @class */ (function () {
    function Module() {
    }
    Module = __decorate([
        core_1.NgModule({
            imports: [
                forms_1.FormsModule,
                common_1.CommonModule
            ],
            exports: [
                exports.TABS
            ],
            declarations: [
                exports.TABS
            ]
        })
    ], Module);
    return Module;
}());
exports.Module = Module;
//# sourceMappingURL=tabs.component.js.map