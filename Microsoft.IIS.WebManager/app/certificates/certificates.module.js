"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var forms_1 = require("@angular/forms");
var bmodel_1 = require("../common/bmodel");
var notfound_component_1 = require("../common/notfound.component");
var selector_1 = require("../common/selector");
var loading_component_1 = require("../notification/loading.component");
var virtual_list_component_1 = require("../common/virtual-list.component");
var certificates_component_1 = require("./certificates.component");
var certificates_list_component_1 = require("./certificates-list.component");
var certificate_list_item_1 = require("./certificate-list-item");
var certificate_details_component_1 = require("./certificate-details.component");
var certificates_service_1 = require("./certificates.service");
var CertificatesModule = /** @class */ (function () {
    function CertificatesModule() {
    }
    CertificatesModule = __decorate([
        core_1.NgModule({
            imports: [
                forms_1.FormsModule,
                common_1.CommonModule,
                bmodel_1.Module,
                notfound_component_1.Module,
                selector_1.Module,
                loading_component_1.Module,
                virtual_list_component_1.Module
            ],
            exports: [
                certificates_component_1.CertificatesComponent,
                certificates_list_component_1.CertificatesListComponent,
                certificate_list_item_1.CertificateListItem,
                certificate_details_component_1.CertificateDetailsComponent
            ],
            declarations: [
                certificates_component_1.CertificatesComponent,
                certificates_list_component_1.CertificatesListComponent,
                certificate_list_item_1.CertificateListItem,
                certificate_details_component_1.CertificateDetailsComponent
            ],
            providers: [
                certificates_service_1.CertificatesService
            ]
        })
    ], CertificatesModule);
    return CertificatesModule;
}());
exports.CertificatesModule = CertificatesModule;
//# sourceMappingURL=certificates.module.js.map