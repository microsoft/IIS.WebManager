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
var bmodel_1 = require("../../common/bmodel");
var switch_component_1 = require("../../common/switch.component");
var loading_component_1 = require("../../notification/loading.component");
var override_mode_component_1 = require("../../common/override-mode.component");
var error_component_1 = require("../../error/error.component");
var tabs_component_1 = require("../../common/tabs.component");
var http_response_headers_service_1 = require("./http-response-headers.service");
var custom_headers_component_1 = require("./custom-headers.component");
var http_response_headers_component_1 = require("./http-response-headers.component");
var redirect_headers_component_1 = require("./redirect-headers.component");
var HttpResponseHeadersModule = /** @class */ (function () {
    function HttpResponseHeadersModule() {
    }
    HttpResponseHeadersModule = __decorate([
        core_1.NgModule({
            imports: [
                common_1.CommonModule,
                forms_1.FormsModule,
                bmodel_1.Module,
                switch_component_1.Module,
                loading_component_1.Module,
                override_mode_component_1.Module,
                error_component_1.Module,
                tabs_component_1.Module
            ],
            declarations: [
                custom_headers_component_1.CustomHeadersComponent,
                http_response_headers_component_1.HttpResponseHeadersComponent,
                redirect_headers_component_1.RedirectHeadersComponent
            ],
            providers: [
                http_response_headers_service_1.HttpResponseHeadersService
            ]
        })
    ], HttpResponseHeadersModule);
    return HttpResponseHeadersModule;
}());
exports.HttpResponseHeadersModule = HttpResponseHeadersModule;
//# sourceMappingURL=http-response-headers.module.js.map