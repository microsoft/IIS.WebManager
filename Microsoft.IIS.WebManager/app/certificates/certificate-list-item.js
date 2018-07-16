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
var selector_1 = require("../common/selector");
var certificate_1 = require("./certificate");
var CertificateListItem = /** @class */ (function () {
    function CertificateListItem() {
    }
    CertificateListItem.prototype.toggleView = function () {
        this._viewing = !this._viewing;
    };
    Object.defineProperty(CertificateListItem.prototype, "validTo", {
        get: function () {
            return certificate_1.Certificate.friendlyValidTo(this.model);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CertificateListItem.prototype, "issuedBy", {
        get: function () {
            return certificate_1.Certificate.friendlyIssuedBy(this.model);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CertificateListItem.prototype, "displayName", {
        get: function () {
            return certificate_1.Certificate.displayName(this.model);
        },
        enumerable: true,
        configurable: true
    });
    CertificateListItem.prototype.onDetails = function (e) {
        e.preventDefault();
        this._selector.close();
        this.toggleView();
    };
    CertificateListItem.prototype.prevent = function (e) {
        e.preventDefault();
    };
    CertificateListItem.prototype.openSelector = function (e) {
        e.preventDefault();
        this._selector.toggle();
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", certificate_1.Certificate)
    ], CertificateListItem.prototype, "model", void 0);
    __decorate([
        core_1.ViewChild(selector_1.Selector),
        __metadata("design:type", selector_1.Selector)
    ], CertificateListItem.prototype, "_selector", void 0);
    CertificateListItem = __decorate([
        core_1.Component({
            selector: 'certificate',
            template: "\n        <div *ngIf=\"model\" class=\"grid-item row\" tabindex=\"-1\">\n            <div *ngIf=\"!_viewing\" class=\"row-data\">\n                <div class=\"visible-xs col-xs-9 col-data cer\">\n                    <label>Name</label>\n                    <span>{{displayName}}</span>\n                    <label>Valid To</label>\n                    <span>{{validTo}}</span>\n                </div>\n                <div class=\"col-xs-12 col-sm-6 col-md-4 col-lg-3 hidden-xs cer\">\n                    <span class='name'>{{displayName}}</span>\n                </div>\n                <div class=\"col-xs-4 col-md-4 col-lg-3 hidden-xs support\">\n                    <span>{{model.subject}}</span>\n                </div>\n                <div class=\"col-xs-2 col-lg-2 hidden-xs hidden-sm support\">\n                    <span>{{issuedBy}}</span>\n                </div>\n                <div class=\"col-lg-1 col-md-1 hidden-xs hidden-sm support\">\n                    <span>{{model.store && model.store.name}}</span>\n                </div>\n                <div class=\"col-lg-2 hidden-xs hidden-sm hidden-md support\">\n                    <span>{{validTo}}</span>\n                </div>\n            </div>\n            <div class=\"actions\">\n                <div class=\"selector-wrapper\">\n                    <button title=\"More\" (click)=\"openSelector($event)\" (dblclick)=\"prevent($event)\" [class.background-active]=\"(_selector && _selector.opened) || false\">\n                        <i class=\"fa fa-ellipsis-h\"></i>\n                    </button>\n                    <selector [right]=\"true\">\n                        <ul>\n                            <li><button *ngIf=\"!_viewing\" class=\"edit\" title=\"Details\" (click)=\"onDetails($event)\">Details</button></li>\n                            <li><button  *ngIf=\"_viewing\" class=\"cancel\" title=\"Close\" (click)=\"onDetails($event)\">Close</button></li>\n                        </ul>\n                    </selector>\n                </div>\n            </div>\n            <certificate-details *ngIf=\"_viewing\" [model]=\"model\"></certificate-details>\n        </div>\n    ",
            styles: ["\n        [class*=\"col-\"] {\n            overflow: hidden;\n            text-overflow: ellipsis;\n            white-space: nowrap;\n        }\n\n        .visible-xs span {\n            display: block;\n        }\n\n        .visible-xs span:not(:last-of-type) {\n            margin-bottom: 10px;\n        }\n\n        .row {\n            margin: 0px;\n        }\n\n        .row-data {\n            line-height: 30px;\n        }\n\n        .col-data {\n            line-height: 20px;\n        }\n\n        .cer {\n            padding-left: 0;\n        }\n\n        .support {\n            font-size: 85%;\n        }\n\n        .selector-wrapper {\n            position: relative;\n            line-height: 22px;\n        }\n\n        selector {\n            position:absolute;\n            right:0;\n            top: 32px;\n        }\n\n        selector button {\n            min-width: 125px;\n            width: 100%;\n        }\n    "]
        })
    ], CertificateListItem);
    return CertificateListItem;
}());
exports.CertificateListItem = CertificateListItem;
//# sourceMappingURL=certificate-list-item.js.map