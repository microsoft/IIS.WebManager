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
var certificate_list_item_1 = require("./certificate-list-item");
var certificate_1 = require("./certificate");
var virtual_list_component_1 = require("../common/virtual-list.component");
var certificates_service_1 = require("./certificates.service");
var CertificatesListComponent = /** @class */ (function () {
    function CertificatesListComponent(_service) {
        this._service = _service;
        this.itemSelected = new core_1.EventEmitter();
        this._filter = "";
        this._view = [];
        this._range = new virtual_list_component_1.Range(0, 0);
        this._subscriptions = [];
    }
    CertificatesListComponent.prototype.ngOnInit = function () {
        if (!this.lazy) {
            this.activate();
        }
    };
    CertificatesListComponent.prototype.ngOnDestroy = function () {
        this._subscriptions.forEach(function (s) { return s.unsubscribe(); });
    };
    CertificatesListComponent.prototype.activate = function () {
        var _this = this;
        this._service.certificates.subscribe(function (certs) {
            _this.certs = certs;
            _this.filter(_this._filter);
        });
        this.refresh();
    };
    CertificatesListComponent.prototype.selectCert = function (cert, evt) {
        if (evt.defaultPrevented) {
            return;
        }
        this.itemSelected.emit(cert);
    };
    CertificatesListComponent.prototype.onRangeChange = function (range) {
        virtual_list_component_1.Range.fillView(this._view, this._items, range);
        this._range = range;
    };
    CertificatesListComponent.prototype.filter = function (filter) {
        if (!filter) {
            this._items = this.certs;
            return;
        }
        filter = ("*" + this._filter + "*").replace("**", "*").replace("?", "");
        var rule = new RegExp("^" + filter.split("*").join(".*") + "$", "i");
        this._items = this.certs.filter(function (c) { return rule.test(certificate_1.Certificate.displayName(c)); });
        this.onRangeChange(this._range);
    };
    CertificatesListComponent.prototype.refresh = function () {
        this._service.load();
    };
    CertificatesListComponent.prototype.onDblClick = function (e, index) {
        if (e.defaultPrevented) {
            return;
        }
        this._listItems.forEach(function (c, i) {
            if (i == index) {
                c.toggleView();
            }
        });
    };
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], CertificatesListComponent.prototype, "itemSelected", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], CertificatesListComponent.prototype, "lazy", void 0);
    __decorate([
        core_1.ViewChildren(certificate_list_item_1.CertificateListItem),
        __metadata("design:type", core_1.QueryList)
    ], CertificatesListComponent.prototype, "_listItems", void 0);
    CertificatesListComponent = __decorate([
        core_1.Component({
            selector: 'certificates-list',
            template: "\n        <loading *ngIf=\"!_items\"></loading>\n        <div class=\"toolbar\">\n            <span *ngIf=\"_service.loading\" class=\"loading\">Retrieving certificates</span>\n            <button class=\"refresh\" title=\"Refresh\" (click)=\"refresh()\"></button>\n            <div *ngIf=\"_items\" class=\"col-xs-8 col-sm-5 col-md-4 col-lg-3 actions filter hidden-xs\">\n                <input type=\"search\" class=\"form-control\" [class.border-active]=\"_filter\" [(ngModel)]=\"_filter\" (ngModelChange)=\"filter($event)\" [throttle]=\"300\" />\n            </div>\n            <div class=\"clear\"></div>\n        </div>\n        <div *ngIf=\"_items\" class=\"container-fluid\">\n            <div class=\"border-active grid-list-header row hidden-xs\" [hidden]=\"_items.length == 0\">\n                <label class=\"col-xs-12 col-sm-6 col-md-4 col-lg-3\">Name</label>\n                <label class=\"col-xs-4 col-md-4 col-lg-3\">Subject</label>\n                <label class=\"col-xs-2 col-lg-2 hidden-xs hidden-sm\">Issued By</label>\n                <label class=\"col-lg-1 col-md-1 hidden-xs hidden-sm\">Store</label>\n                <label class=\"col-lg-2 hidden-xs hidden-sm hidden-md\">Valid To</label>\n            </div>\n        </div>\n        <virtual-list class=\"container-fluid grid-list\"\n                        *ngIf=\"_items\"\n                        [count]=\"_items.length\"\n                        (rangeChange)=\"onRangeChange($event)\">\n            <li class=\"hover-editing\"\n                            *ngFor=\"let cert of _view; let i = index;\"\n                            (click)=\"selectCert(cert, $event)\"\n                            (dblclick)=\"onDblClick($event, i)\">\n                <certificate [model]=\"cert\"></certificate>\n            </li>\n        </virtual-list>\n    ",
            styles: ["\n        .grid-item:hover {\n            cursor: pointer;\n        }\n\n        li > div {\n            overflow: hidden;\n            text-overflow: ellipsis;\n        }\n\n        .grid-item small {\n            font-size: 11px;\n            padding-left: 22px;\n            font-weight: normal;\n            display: block;\n            line-height: 10px;\n            margin-top: -5px;\n        }\n\n        .name {\n            font-size: 16px;\n        }\n\n        .name:before {\n            font-family: FontAwesome;\n            content: \"\\f023\";\n            padding-left: 5px;\n            padding-right: 5px;\n            font-size: 16px;\n        }\n\n        .container-fluid,\n        .row {\n            margin: 0;\n            padding: 0;\n        }\n\n        .toolbar {\n            margin-bottom: 20px;\n        }\n\n        .toolbar button span {\n            font-size: 85%;\n        }\n\n        .toolbar button {\n            border: none;\n            float: right;\n        }\n\n        .toolbar > span {\n            vertical-align: sub;\n        }\n\n        .refresh {\n            margin-left: 10px;\n        }\n    "]
        }),
        __metadata("design:paramtypes", [certificates_service_1.CertificatesService])
    ], CertificatesListComponent);
    return CertificatesListComponent;
}());
exports.CertificatesListComponent = CertificatesListComponent;
//# sourceMappingURL=certificates-list.component.js.map