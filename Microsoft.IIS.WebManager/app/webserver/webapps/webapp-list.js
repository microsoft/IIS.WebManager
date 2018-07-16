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
var webapp_1 = require("./webapp");
var webapps_service_1 = require("./webapps.service");
var websites_service_1 = require("../websites/websites.service");
var WebAppItem = /** @class */ (function () {
    function WebAppItem(_router, _service, _siteService) {
        this._router = _router;
        this._service = _service;
        this._siteService = _siteService;
        this.actions = "";
        this.fields = "";
    }
    Object.defineProperty(WebAppItem.prototype, "url", {
        get: function () {
            if (!this.model.website || this.model.website.bindings.length == 0) {
                return "";
            }
            if (!this._url) {
                this._url = this._siteService.getUrl(this.model.website.bindings[0]) + this.model.path;
            }
            return this._url;
        },
        enumerable: true,
        configurable: true
    });
    WebAppItem.prototype.onDelete = function (e) {
        e.preventDefault();
        this._selector.close();
        if (confirm("Are you sure you want to delete '" + this.model.location + "'?")) {
            this._service.delete(this.model);
        }
    };
    WebAppItem.prototype.onEdit = function (e) {
        e.stopPropagation();
        this._selector.close();
        this._router.navigate(['webserver', 'webapps', this.model.id]);
    };
    WebAppItem.prototype.action = function (action) {
        return this.actions.indexOf(action) >= 0;
    };
    WebAppItem.prototype.field = function (f) {
        return this.fields.indexOf(f) >= 0;
    };
    WebAppItem.prototype.prevent = function (e) {
        e.preventDefault();
    };
    WebAppItem.prototype.openSelector = function (e) {
        e.preventDefault();
        this._selector.toggle();
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", webapp_1.WebApp)
    ], WebAppItem.prototype, "model", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], WebAppItem.prototype, "actions", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], WebAppItem.prototype, "fields", void 0);
    __decorate([
        core_1.ViewChild(selector_1.Selector),
        __metadata("design:type", selector_1.Selector)
    ], WebAppItem.prototype, "_selector", void 0);
    WebAppItem = __decorate([
        core_1.Component({
            selector: 'webapp-item',
            template: "\n    <div class='row grid-item'>\n        <div>\n            <div class='col-xs-8 col-sm-4'>\n                <div class='name'>\n                    <a class=\"color-normal hover-color-active\" [routerLink]=\"['/webserver/webapps', model.id]\">{{model.path}}</a>\n                    <div>\n                        <div *ngIf=\"field('app-pool')\">\n                            <small class='physical-path'>{{model.physical_path}}</small>\n                        </div>\n                        <div *ngIf=\"field('site')\">\n                            <small class='physical-path hidden-xs'>{{model.physical_path}}</small>\n                            <small class='visible-xs'>{{model.website.name}}</small>\n                        </div>\n                    </div>\n                </div>\n            </div>\n            <div class='col-sm-2 hidden-xs valign' *ngIf=\"field('app-pool')\">\n                <div *ngIf='model.application_pool'>\n                    <span class=\"block\">{{model.application_pool.name}}<span class=\"status\" *ngIf=\"model.application_pool.status != 'started'\">  ({{model.application_pool.status}})</span></span>\n                </div>\n            </div>\n            <div class='col-sm-2 hidden-xs valign' *ngIf=\"field('site')\">\n                <div *ngIf='model.website'>\n                    <span class=\"block\">{{model.website.name}}<span class=\"status\" *ngIf=\"model.website.status != 'started'\">  ({{model.website.status}})</span></span>\n                </div>\n            </div>\n            <div class='hidden-xs col-sm-4 valign overflow-visible'>\n                <navigator [model]=\"model.website.bindings\" [path]=\"model.path\" [right]=\"true\"></navigator>\n            </div>\n        <div>\n        <div class=\"actions\" *ngIf=\"actions\">\n            <div class=\"selector-wrapper\">\n                <button title=\"More\" (click)=\"openSelector($event)\" (dblclick)=\"prevent($event)\" [class.background-active]=\"(_selector && _selector.opened) || false\">\n                    <i class=\"fa fa-ellipsis-h\"></i>\n                </button>\n                <selector [right]=\"true\">\n                    <ul>\n                        <li *ngIf=\"action('edit')\"><button class=\"edit\" title=\"Edit\" (click)=\"onEdit($event)\">Edit</button></li>\n                        <li *ngIf=\"action('browse')\"><a class=\"bttn link\" href={{url}} title={{url}} target=\"_blank\">Browse</a></li>\n                        <li *ngIf=\"action('delete')\"><button class=\"delete\" title=\"Delete\" (click)=\"onDelete($event)\">Delete</button></li>\n                    </ul>\n                </selector>\n            </div>\n        </div>\n    </div>\n    ",
            styles: ["\n        .name i {   \n            display: block;\n            float: left;\n            font-size: 18px;\n            padding-right: 10px;\n            padding-top: 3px;\n        }\n\n        .name i.visible-xs {\n            font-size: 26px;\n            margin-top: 3px;\n        }\n\n        .name {\n            font-size: 16px;\n            max-width: 100%;\n        }\n\n        .name small {\n            font-size: 12px;\n        }\n\n        .name .physical-path {\n            text-transform: lowercase;\n        }\n\n        .grid-item {\n            margin: 0;\n        }\n\n        .actions {\n            padding-top: 4px;\n        }\n\n        a {\n            background: transparent;\n            display: inline;\n        }\n\n        .selector-wrapper {\n            position: relative;\n        }\n\n        .v-align {\n            padding-top: 6px;\n        }\n\n        selector {\n            position:absolute;\n            right:0;\n            top: 32px;\n        }\n\n        selector button {\n            min-width: 125px;\n            width: 100%;\n        }\n    "]
        }),
        __param(1, core_1.Inject("WebAppsService")),
        __param(2, core_1.Inject("WebSitesService")),
        __metadata("design:paramtypes", [router_1.Router,
            webapps_service_1.WebAppsService,
            websites_service_1.WebSitesService])
    ], WebAppItem);
    return WebAppItem;
}());
exports.WebAppItem = WebAppItem;
var WebAppList = /** @class */ (function () {
    function WebAppList(_router) {
        this._router = _router;
        this.fields = "path,site,app-pool";
        this.actions = "edit,browse,delete";
        this.itemSelected = new core_1.EventEmitter();
        this.sort("path");
    }
    WebAppList.prototype.onItemClicked = function (e, app) {
        if (e.defaultPrevented) {
            return;
        }
        if (this.itemSelected.observers.length > 0) {
            this.itemSelected.emit(app);
        }
    };
    WebAppList.prototype.onDblClick = function (e, app) {
        if (e.defaultPrevented) {
            return;
        }
        this._router.navigate(['webserver', 'webapps', app.id]);
    };
    WebAppList.prototype.field = function (f) {
        return this.fields.indexOf(f) >= 0;
    };
    WebAppList.prototype.sort = function (field) {
        this._orderByAsc = (field == this._orderBy) ? !this._orderByAsc : true;
        this._orderBy = field;
    };
    WebAppList.prototype.css = function (field) {
        if (this._orderBy == field) {
            return {
                "orderby": true,
                "desc": !this._orderByAsc
            };
        }
        return {};
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Array)
    ], WebAppList.prototype, "model", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], WebAppList.prototype, "fields", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], WebAppList.prototype, "actions", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], WebAppList.prototype, "itemSelected", void 0);
    WebAppList = __decorate([
        core_1.Component({
            selector: 'webapp-list',
            template: "\n        <div class=\"container-fluid\">\n            <div class=\"hidden-xs border-active grid-list-header row\" [hidden]=\"model.length == 0\">\n                <label class=\"col-xs-8 col-sm-4\" [ngClass]=\"css('path')\" (click)=\"sort('path')\">Path</label>\n                <label class=\"col-sm-2\" *ngIf=\"field('app-pool')\" [ngClass]=\"css('application_pool.name')\" (click)=\"sort('application_pool.name')\">Application Pool</label>\n                <label class=\"col-sm-2\" *ngIf=\"field('site')\" [ngClass]=\"css('website.name')\" (click)=\"sort('website.name')\">Web Site</label>\n            </div>\n            \n            <ul class=\"grid-list\">\n                <li *ngFor=\"let app of model | orderby: _orderBy: _orderByAsc\" class=\"border-color hover-editing\" (click)=\"onItemClicked($event, app)\">\n                    <webapp-item [model]=\"app\" [actions]=\"actions\" (dblclick)=\"onDblClick($event, app)\" [fields]=\"fields\"></webapp-item>\n                </li>\n            </ul>\n        </div>\n    ",
            styles: ["\n        .container-fluid,\n        .row {\n            margin: 0;\n            padding: 0;\n        }\n    "]
        }),
        __metadata("design:paramtypes", [router_1.Router])
    ], WebAppList);
    return WebAppList;
}());
exports.WebAppList = WebAppList;
//# sourceMappingURL=webapp-list.js.map