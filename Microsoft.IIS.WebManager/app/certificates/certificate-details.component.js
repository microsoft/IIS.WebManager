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
var certificate_1 = require("./certificate");
var CertificateDetailsComponent = /** @class */ (function () {
    function CertificateDetailsComponent() {
    }
    Object.defineProperty(CertificateDetailsComponent.prototype, "validTo", {
        get: function () {
            return certificate_1.Certificate.friendlyValidTo(this.model);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CertificateDetailsComponent.prototype, "validFrom", {
        get: function () {
            return certificate_1.Certificate.friendlyValidFrom(this.model);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CertificateDetailsComponent.prototype, "displayName", {
        get: function () {
            return certificate_1.Certificate.displayName(this.model);
        },
        enumerable: true,
        configurable: true
    });
    __decorate([
        core_1.Input(),
        __metadata("design:type", certificate_1.Certificate)
    ], CertificateDetailsComponent.prototype, "model", void 0);
    CertificateDetailsComponent = __decorate([
        core_1.Component({
            selector: 'certificate-details',
            template: "\n        <div *ngIf=\"model\">\n            <div class=\"inline-block\">\n                <fieldset>\n                    <label>Alias</label>\n                    <span>{{model.friendly_name || model.alias}}</span>\n                </fieldset>\n                <fieldset>\n                    <label>Subject</label>\n                    <span>{{model.subject}}</span>\n                </fieldset>\n                <fieldset>\n                    <label>Issued By</label>\n                    <span>{{model.issued_by}}</span>\n                </fieldset>\n                <fieldset>\n                    <label>Thumbprint</label>\n                    <span>{{model.thumbprint}}</span>\n                </fieldset>\n            </div>\n            <div class=\"inline-block\">\n                <fieldset>\n                    <label>Valid To</label>\n                    <span>{{validTo}}</span>\n                </fieldset>\n                <fieldset>\n                    <label>Valid From</label>\n                    <span>{{validFrom}}</span>\n                </fieldset>\n                <fieldset>\n                    <label>Signature Algorithm</label>\n                    <span>{{model.hash_algorithm || model.signature_algorithm}}</span>\n                </fieldset>\n                <fieldset>\n                    <label>Certificate Store</label>\n                    <span>{{!(model.store) ? \"\" : model.store.name}}</span>\n                </fieldset>\n            </div>\n            <div class=\"inline-block\">\n                <fieldset>\n                    <label>Subject Alternative Names</label>\n                    <ul *ngIf=\"model.subject_alternative_names\">\n                        <li *ngFor=\"let san of model.subject_alternative_names\">\n                            {{san}}\n                        </li>\n                    </ul>\n                </fieldset>\n                <fieldset>\n                    <label>Intended Purposes</label>\n                    <ul *ngIf=\"model.intended_purposes\">\n                        <li *ngFor=\"let purpose of model.intended_purposes\">\n                            {{purpose}}\n                        </li>\n                    </ul>\n                </fieldset>\n            </div>\n        </div>\n    ",
            styles: ["\n        span {\n            display: block;\n        }\n\n        .inline-block {\n            width: 400px;\n            overflow: hidden;\n        }\n\n        div {\n            vertical-align: top;\n        }\n\n        fieldset label {\n            margin-bottom: 5px;\n        }\n    "]
        })
    ], CertificateDetailsComponent);
    return CertificateDetailsComponent;
}());
exports.CertificateDetailsComponent = CertificateDetailsComponent;
//# sourceMappingURL=certificate-details.component.js.map