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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var selector_1 = require("../../common/selector");
var site_1 = require("./site");
var websites_service_1 = require("./websites.service");
var sort_pipe_1 = require("../../common/sort.pipe");
var virtual_list_component_1 = require("../../common/virtual-list.component");
var notification_service_1 = require("../../notification/notification.service");
var WebSiteItem = /** @class */ (function () {
    function WebSiteItem(_service, _notificationService) {
        this._service = _service;
        this._notificationService = _notificationService;
        this.actions = "";
        this.fields = "name,path,status,app-pool";
        this.start = new core_1.EventEmitter();
        this.stop = new core_1.EventEmitter();
        this.delete = new core_1.EventEmitter();
    }
    Object.defineProperty(WebSiteItem.prototype, "url", {
        get: function () {
            if (!this._url && this.model.bindings.length > 0) {
                this._url = this._service.getUrl(this.model.bindings[0]);
            }
            return this._url;
        },
        enumerable: true,
        configurable: true
    });
    WebSiteItem.prototype.onDelete = function (e) {
        var _this = this;
        e.preventDefault();
        this._selector.close();
        this._notificationService.confirm("Delete Web Site", "Are you sure you want to delete '" + this.model.name + "'?")
            .then(function (confirmed) { return confirmed && _this._service.delete(_this.model); });
    };
    WebSiteItem.prototype.onStart = function (e) {
        e.preventDefault();
        this._selector.close();
        this._service.start(this.model);
    };
    WebSiteItem.prototype.onStop = function (e) {
        e.preventDefault();
        this._selector.close();
        this._service.stop(this.model);
    };
    WebSiteItem.prototype.allow = function (action) {
        return this.actions.indexOf(action) >= 0;
    };
    WebSiteItem.prototype.started = function () {
        return this.model.status == 'started';
    };
    WebSiteItem.prototype.field = function (f) {
        return this.fields.indexOf(f) >= 0;
    };
    WebSiteItem.prototype.hasHttps = function () {
        for (var i = 0; i < this.model.bindings.length; ++i) {
            if (this.model.bindings[i].is_https) {
                return true;
            }
        }
        return false;
    };
    WebSiteItem.prototype.openSelector = function (e) {
        e.preventDefault();
        this._selector.toggle();
    };
    WebSiteItem.prototype.prevent = function (e) {
        e.preventDefault();
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", site_1.WebSite)
    ], WebSiteItem.prototype, "model", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], WebSiteItem.prototype, "actions", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], WebSiteItem.prototype, "fields", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], WebSiteItem.prototype, "start", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], WebSiteItem.prototype, "stop", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], WebSiteItem.prototype, "delete", void 0);
    __decorate([
        core_1.ViewChild(selector_1.Selector),
        __metadata("design:type", selector_1.Selector)
    ], WebSiteItem.prototype, "_selector", void 0);
    WebSiteItem = __decorate([
        core_1.Component({
            selector: 'website-item',
            template: "\n    <div *ngIf=\"model\" class=\"row grid-item border-color\">\n        <div class='col-xs-7 col-sm-4 col-md-3 col-lg-3'>\n            <div class='name'>\n                <a class=\"color-normal hover-color-active\" [routerLink]=\"['/webserver/websites', model.id]\">{{model.name}}</a>\n                <small class='physical-path' *ngIf=\"field('path')\">{{model.physical_path}}</small>\n            </div>\n        </div>\n        <div class='col-xs-3 col-sm-2 col-md-1 valign' *ngIf=\"field('status')\">\n            <span class='status' [ngClass]=\"model.status\">{{model.status}}</span>\n            <span title=\"HTTPS is ON\" class=\"visible-xs-inline https\" *ngIf=\"hasHttps()\"></span>\n        </div>\n        <div class='col-lg-2 visible-lg valign'  *ngIf=\"field('app-pool')\">\n            <div *ngIf=\"model.application_pool\">\n                <a [routerLink]=\"['/webserver', 'app-pools', model.application_pool.id]\">\n                    <span [ngClass]=\"model.application_pool.status\">{{model.application_pool.name}}\n                        <span class=\"status\" *ngIf=\"model.application_pool.status != 'started'\">  ({{model.application_pool.status}})</span>\n                    </span>\n                </a>\n            </div>\n        </div>\n        <div class=' hidden-xs col-xs-4 col-xs-push-1 col-sm-3 col-md-3 valign overflow-visible' *ngIf=\"allow('browse')\">\n            <navigator [model]=\"model.bindings\" [right]=\"true\"></navigator>\n        </div>\n        <div class=\"actions\">\n            <div class=\"selector-wrapper\">\n                <button title=\"More\" (click)=\"openSelector($event)\" (dblclick)=\"prevent($event)\" [class.background-active]=\"(_selector && _selector.opened) || false\">\n                    <i class=\"fa fa-ellipsis-h\"></i>\n                </button>\n                <selector [right]=\"true\">\n                    <ul>\n                        <li *ngIf=\"allow('edit')\"><a class=\"bttn edit\" [routerLink]=\"['/webserver/websites', model.id]\">Edit</a></li>\n                        <li *ngIf=\"allow('browse')\"><a class=\"bttn link\" href={{url}} title={{url}} target=\"_blank\">Browse</a></li>\n                        <li *ngIf=\"allow('start')\"><button class=\"start\" [attr.disabled]=\"model.status != 'stopped' || null\" (click)=\"onStart($event)\">Start</button></li>\n                        <li *ngIf=\"allow('stop')\"><button class=\"stop\" [attr.disabled]=\"!started() || null\" (click)=\"onStop($event)\">Stop</button></li>\n                        <li *ngIf=\"allow('delete')\"><button class=\"delete\" (click)=\"onDelete($event)\">Delete</button></li>\n                    </ul>\n                </selector>\n            </div>\n        </div>\n    </div>\n    ",
            styles: ["\n        button {\n            border: none;\n            display: inline-flex;\n        }\n\n        .name {\n            font-size: 16px;\n            white-space: nowrap;\n            text-overflow: ellipsis;\n            overflow: hidden;\n        }\n\n        .https:after {\n            font-family: FontAwesome;\n            content: \"\\f023\";\n            padding-left: 5px;\n        }\n\n        a {\n            background: transparent;\n            display: inline;\n        }\n\n        .status {\n            text-transform: capitalize;\n        }\n        \n        .name small {\n            font-size: 12px;\n        }\n\n        .name .physical-path {\n            text-transform: lowercase;\n        }\n\n        .row {\n            margin: 0;\n        }\n\n        .actions {\n            padding-top: 4px;\n        }\n\n        .selector-wrapper {\n            position: relative;\n        }\n\n        selector {\n            position:absolute;\n            right:0;\n            top: 32px;\n        }\n\n        selector button,\n        selector .bttn {\n            min-width: 125px;\n            width: 100%;\n        }\n    "]
        }),
        __param(0, core_1.Inject("WebSitesService")),
        __metadata("design:paramtypes", [websites_service_1.WebSitesService,
            notification_service_1.NotificationService])
    ], WebSiteItem);
    return WebSiteItem;
}());
exports.WebSiteItem = WebSiteItem;
var WebSiteList = /** @class */ (function () {
    function WebSiteList(_router) {
        this._router = _router;
        this.fields = "name,path,status,app-pool";
        this.actions = "edit,browse,start,stop,delete";
        this.itemSelected = new core_1.EventEmitter();
        this._orderBy = new sort_pipe_1.OrderBy();
        this._sortPipe = new sort_pipe_1.SortPipe();
        this._range = new virtual_list_component_1.Range(0, 0);
        this._view = [];
    }
    WebSiteList.prototype.ngOnInit = function () {
        this.onRangeChange(this._range);
    };
    WebSiteList.prototype.onItemClicked = function (e, site) {
        if (e.defaultPrevented) {
            return;
        }
        if (this.itemSelected.observers.length > 0) {
            this.itemSelected.emit(site);
        }
    };
    WebSiteList.prototype.onDblClick = function (e, site) {
        if (e.defaultPrevented) {
            return;
        }
        this._router.navigate(['webserver', 'websites', site.id]);
    };
    WebSiteList.prototype.hasField = function (field) {
        return this.fields.indexOf(field) >= 0;
    };
    WebSiteList.prototype.onRangeChange = function (range) {
        virtual_list_component_1.Range.fillView(this._view, this.model, range);
        this._range = range;
    };
    WebSiteList.prototype.doSort = function (field) {
        this._orderBy.sort(field);
        this._sortPipe.transform(this.model, this._orderBy.Field, this._orderBy.Asc, null, true);
        this.onRangeChange(this._range);
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Array)
    ], WebSiteList.prototype, "model", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], WebSiteList.prototype, "fields", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], WebSiteList.prototype, "actions", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], WebSiteList.prototype, "itemSelected", void 0);
    WebSiteList = __decorate([
        core_1.Component({
            selector: 'website-list',
            template: "\n        <div class=\"container-fluid\">\n            <div class=\"hidden-xs border-active grid-list-header row\" [hidden]=\"model.length == 0\">\n                <label class=\"col-xs-8 col-sm-4 col-md-3 col-lg-3\" [ngClass]=\"_orderBy.css('name')\" (click)=\"doSort('name')\">Name</label>\n                <label class=\"col-xs-3 col-md-1 col-lg-1\" [ngClass]=\"_orderBy.css('status')\" (click)=\"doSort('status')\">Status</label>\n                <label class=\"col-lg-2 visible-lg\" *ngIf=\"hasField('app-pool')\" [ngClass]=\"_orderBy.css('application_pool.name')\" (click)=\"doSort('application_pool.name')\">Application Pool</label>\n            </div>\n            <virtual-list class=\"grid-list\"\n                        *ngIf=\"model\"\n                        [count]=\"model.length\"\n                        (rangeChange)=\"onRangeChange($event)\">\n                <li class=\"hover-editing\" tabindex=\"-1\" *ngFor=\"let s of _view\">\n                    <website-item (click)=\"onItemClicked($event, s)\" (dblclick)=\"onDblClick($event, s)\" [model]=\"s\" [actions]=\"actions\" [fields]=\"fields\"></website-item>\n                </li>\n            </virtual-list>\n        </div>\n    ",
            styles: ["\n        .container-fluid,\n        .row {\n            margin: 0;\n            padding: 0;\n        }\n    "]
        }),
        __metadata("design:paramtypes", [router_1.Router])
    ], WebSiteList);
    return WebSiteList;
}());
exports.WebSiteList = WebSiteList;
//# sourceMappingURL=website-list.js.map