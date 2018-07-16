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
var section_helper_1 = require("./section.helper");
var VTabsComponent = /** @class */ (function () {
    function VTabsComponent(_elem, _renderer, _activatedRoute, _location, _router) {
        this._elem = _elem;
        this._renderer = _renderer;
        this._activatedRoute = _activatedRoute;
        this._location = _location;
        this._router = _router;
        this.activate = new core_1.EventEmitter();
        this._selectedIndex = -1;
        this._menuOn = false;
        this._hashCache = [];
        this._subscriptions = [];
        this.tabs = [];
        this._default = this._activatedRoute.snapshot.params["section"];
    }
    VTabsComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        this._sectionHelper = new section_helper_1.SectionHelper(this.tabs.map(function (t) { return t.name; }), this._default, this.markLocation, this._location, this._activatedRoute, this._router);
        this._subscriptions.push(this._sectionHelper.active.subscribe(function (sec) { return _this.onSectionChange(sec); }));
        this._subscriptions.push(this.its.changes.subscribe(function (change) {
            var arr = change.toArray();
            arr.forEach(function (item) {
                if (!_this.tabs.find(function (t) { return t == item; })) {
                    _this.addTab(item);
                }
            });
        }));
        this._tabsItems = this._tabList.toArray();
        window.setTimeout(function () {
            _this.refresh();
        }, 1);
    };
    VTabsComponent.prototype.ngOnDestroy = function () {
        this._subscriptions.forEach(function (sub) {
            sub.unsubscribe();
        });
        if (this._sectionHelper != null) {
            this._sectionHelper.dispose();
            this._sectionHelper = null;
        }
    };
    VTabsComponent.prototype.addTab = function (tab) {
        if (this._selectedIndex === -1 && (this.tabs.length === 0 && !this._default || section_helper_1.SectionHelper.normalize(tab.name) == this._default)) {
            tab.activate();
            this._selectedIndex = this.tabs.length;
        }
        if (this._sectionHelper) {
            this._sectionHelper.addSection(tab.name);
        }
        this.tabs.push(tab);
    };
    VTabsComponent.prototype.removeTab = function (tab) {
        this._sectionHelper.removeSection(tab.name);
        var i = this.tabs.findIndex(function (item) { return item == tab; });
        if (i != -1) {
            this.tabs.splice(i, 1);
        }
    };
    VTabsComponent.prototype.selectItem = function (index) {
        var tab = this.tabs[index];
        if (!tab.routerLink) {
            this._sectionHelper.selectSection(tab.name);
        }
        else {
            tab.activate();
        }
    };
    VTabsComponent.prototype.onSectionChange = function (section) {
        var index = this.tabs.findIndex(function (t) { return t.name === section; });
        if (index == -1) {
            index = 0;
        }
        this.tabs.forEach(function (t) { return t.deactivate(); });
        this.tabs[index].activate();
        this._selectedIndex = index;
        this.refresh();
        this.activate.emit(this.tabs[index]);
    };
    VTabsComponent.prototype.showMenu = function (show) {
        this._menuOn = (show == null) ? true : show;
    };
    VTabsComponent.prototype.refresh = function () {
        if (!this._tabsItems || this._selectedIndex < 0) {
            return;
        }
        this.tabs.forEach(function (t) { t.visible = true; });
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], VTabsComponent.prototype, "markLocation", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], VTabsComponent.prototype, "activate", void 0);
    __decorate([
        core_1.ViewChildren('item'),
        __metadata("design:type", core_1.QueryList)
    ], VTabsComponent.prototype, "_tabList", void 0);
    __decorate([
        core_1.ContentChildren(core_1.forwardRef(function () { return Item; })),
        __metadata("design:type", core_1.QueryList)
    ], VTabsComponent.prototype, "its", void 0);
    VTabsComponent = __decorate([
        core_1.Component({
            selector: 'vtabs',
            template: "\n        <div class=\"vtabs\">\n            <ul class=\"items\">\n                <li #item class=\"hover-edit\"  *ngFor=\"let tab of tabs; let i = index;\" [ngClass]=\"{active: tab.active}\" (click)=\"selectItem(i)\">\n                    <i [class]=\"tab.ico\"></i><span class=\"border-active\">{{tab.name}}</span>\n                </li>\n            </ul>\n            <div class=\"content\">\n                <ng-content></ng-content>\n            </div>\n        </div>\n    ",
            styles: ["\n        .content {\n            min-width: 320px;\n        }\n    "],
            host: {
                '(window:resize)': 'refresh()'
            }
        }),
        __metadata("design:paramtypes", [core_1.ElementRef,
            core_1.Renderer,
            router_1.ActivatedRoute,
            common_1.Location,
            router_1.Router])
    ], VTabsComponent);
    return VTabsComponent;
}());
exports.VTabsComponent = VTabsComponent;
var Item = /** @class */ (function () {
    function Item(_tabs, _router) {
        this._tabs = _tabs;
        this._router = _router;
        this.ico = "";
        this.visible = true;
    }
    Item.prototype.ngOnInit = function () {
        this._tabs.addTab(this);
    };
    Item.prototype.activate = function () {
        if (this.dynamicChildren) {
            this.dynamicChildren.forEach(function (child) { return child.activate(); });
        }
        if (this.routerLink) {
            this._router.navigate(this.routerLink);
        }
        this.active = true;
    };
    Item.prototype.deactivate = function () {
        if (this.dynamicChildren) {
            this.dynamicChildren.forEach(function (child) { return child.deactivate(); });
        }
        this.active = false;
    };
    Item.prototype.ngOnDestroy = function () {
        if (this.dynamicChildren) {
            this.dynamicChildren.forEach(function (child) { return child.deactivate(); });
            this.dynamicChildren.forEach(function (child) { return child.destroy(); });
        }
        this._tabs.removeTab(this);
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], Item.prototype, "name", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], Item.prototype, "ico", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], Item.prototype, "visible", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], Item.prototype, "active", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Array)
    ], Item.prototype, "routerLink", void 0);
    __decorate([
        core_1.ContentChildren(dynamic_component_1.DynamicComponent),
        __metadata("design:type", core_1.QueryList)
    ], Item.prototype, "dynamicChildren", void 0);
    Item = __decorate([
        core_1.Component({
            selector: 'vtabs > item',
            template: "\n        <div *ngIf=\"!(!active)\">\n            <h1 class=\"border-active\">{{name}}</h1>\n            <ng-content></ng-content>\n        </div>\n    ",
            styles: ["\n        h1 {\n            margin: 0;\n            padding: 0;\n            margin-bottom: 30px;\n            line-height: 34px;\n            font-size: 18px;\n            border-bottom-style: dotted;\n            border-bottom-width: 1px;\n        }\n    "],
        }),
        __metadata("design:paramtypes", [VTabsComponent, router_1.Router])
    ], Item);
    return Item;
}());
exports.Item = Item;
exports.TABS = [
    VTabsComponent,
    Item
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
//# sourceMappingURL=vtabs.component.js.map