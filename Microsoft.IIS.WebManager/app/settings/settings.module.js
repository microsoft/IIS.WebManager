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
var selector_1 = require("../common/selector");
var checkbox_component_1 = require("../common/checkbox.component");
var tooltip_component_1 = require("../common/tooltip.component");
var vtabs_component_1 = require("../common/vtabs.component");
var settings_routes_1 = require("./settings.routes");
var settings_component_1 = require("./settings.component");
var server_list_1 = require("./server-list");
var server_list_item_1 = require("./server-list-item");
var SettingsModule = /** @class */ (function () {
    function SettingsModule() {
    }
    SettingsModule = __decorate([
        core_1.NgModule({
            imports: [
                common_1.CommonModule,
                forms_1.FormsModule,
                settings_routes_1.Routing,
                bmodel_1.Module,
                selector_1.Module,
                checkbox_component_1.Module,
                tooltip_component_1.Module,
                vtabs_component_1.Module
            ],
            declarations: [
                settings_component_1.SettingsComponent,
                server_list_1.ServerListComponent,
                server_list_item_1.ServerListItem
            ]
        })
    ], SettingsModule);
    return SettingsModule;
}());
exports.SettingsModule = SettingsModule;
//# sourceMappingURL=settings.module.js.map