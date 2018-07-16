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
var router_1 = require("@angular/router");
var bmodel_1 = require("../../common/bmodel");
var switch_component_1 = require("../../common/switch.component");
var checkbox_component_1 = require("../../common/checkbox.component");
var loading_component_1 = require("../../notification/loading.component");
var override_mode_component_1 = require("../../common/override-mode.component");
var enum_component_1 = require("../../common/enum.component");
var error_component_1 = require("../../error/error.component");
var tabs_component_1 = require("../../common/tabs.component");
var selector_1 = require("../../common/selector");
var text_toggle_component_1 = require("../../common/text-toggle.component");
var string_list_component_1 = require("../../common/string-list.component");
var tooltip_component_1 = require("../../common/tooltip.component");
var url_rewrite_component_1 = require("./url-rewrite.component");
//
// Inbound Rules
var inbound_rules_component_1 = require("./inbound-rules/inbound-rules.component");
var inbound_rule_component_1 = require("./inbound-rules/inbound-rule.component");
var inbound_rule_edit_1 = require("./inbound-rules/inbound-rule-edit");
var inbound_rule_settings_1 = require("./inbound-rules/inbound-rule-settings");
var inbound_rule_action_1 = require("./inbound-rules/inbound-rule-action");
var inbound_rule_conditions_1 = require("./inbound-rules/inbound-rule-conditions");
var inbound_rule_variables_1 = require("./inbound-rules/inbound-rule-variables");
//
// Server Variables
var server_variables_component_1 = require("./server-variables/server-variables.component");
//
// Outbound Rules
var outbound_rule_component_1 = require("./outbound-rules/outbound-rule.component");
var outbound_rules_component_1 = require("./outbound-rules/outbound-rules.component");
var outbound_rule_edit_1 = require("./outbound-rules/outbound-rule-edit");
var outbound_rule_settings_1 = require("./outbound-rules/outbound-rule-settings");
var outbound_rule_type_1 = require("./outbound-rules/outbound-rule-type");
//
// Rewrite Maps
var rewrite_maps_component_1 = require("./rewrite-maps/rewrite-maps.component");
var rewrite_map_component_1 = require("./rewrite-maps/rewrite-map.component");
var rewrite_map_edit_1 = require("./rewrite-maps/rewrite-map-edit");
var mapping_component_1 = require("./rewrite-maps/mapping.component");
//
// Providers
var providers_component_1 = require("./providers/providers.component");
var provider_component_1 = require("./providers/provider.component");
var provider_edit_1 = require("./providers/provider-edit");
var setting_component_1 = require("./providers/setting.component");
var url_rewrite_service_1 = require("./service/url-rewrite.service");
var UrlRewriteModule = /** @class */ (function () {
    function UrlRewriteModule() {
    }
    UrlRewriteModule = __decorate([
        core_1.NgModule({
            imports: [
                common_1.CommonModule,
                forms_1.FormsModule,
                router_1.RouterModule,
                bmodel_1.Module,
                switch_component_1.Module,
                checkbox_component_1.Module,
                loading_component_1.Module,
                override_mode_component_1.Module,
                enum_component_1.Module,
                error_component_1.Module,
                tabs_component_1.Module,
                selector_1.Module,
                text_toggle_component_1.Module,
                string_list_component_1.Module,
                tooltip_component_1.Module
            ],
            declarations: [
                url_rewrite_component_1.UrlRewriteComponent,
                inbound_rules_component_1.InboundRulesComponent,
                inbound_rule_component_1.InboundRuleComponent,
                inbound_rule_edit_1.InboundRuleEditComponent,
                inbound_rule_settings_1.InboundRuleSettingsComponent,
                inbound_rule_action_1.InboundRuleActionComponent,
                inbound_rule_conditions_1.InboundRuleConditionsComponent,
                inbound_rule_conditions_1.InboundRuleConditionComponent,
                inbound_rule_conditions_1.ConditionEditComponent,
                inbound_rule_variables_1.InboundRuleVariablesComponent,
                inbound_rule_variables_1.InboundRuleVariableComponent,
                inbound_rule_variables_1.VariableEditComponent,
                server_variables_component_1.ServerVariablesComponent,
                outbound_rule_edit_1.OutboundRuleEditComponent,
                outbound_rule_settings_1.OutboundRuleSettingsComponent,
                outbound_rule_type_1.OutboundRuleTypeComponent,
                outbound_rule_component_1.OutboundRuleComponent,
                outbound_rules_component_1.OutboundRulesComponent,
                rewrite_maps_component_1.RewriteMapsComponent,
                rewrite_map_component_1.RewriteMapComponent,
                rewrite_map_edit_1.RewriteMapEditComponent,
                mapping_component_1.MappingComponent,
                mapping_component_1.MappingEditComponent,
                providers_component_1.ProvidersComponent,
                provider_component_1.ProviderComponent,
                provider_edit_1.ProviderEditComponent,
                setting_component_1.SettingComponent,
                setting_component_1.SettingEditComponent
            ],
            providers: [
                url_rewrite_service_1.UrlRewriteService
            ]
        })
    ], UrlRewriteModule);
    return UrlRewriteModule;
}());
exports.UrlRewriteModule = UrlRewriteModule;
//# sourceMappingURL=url-rewrite.module.js.map