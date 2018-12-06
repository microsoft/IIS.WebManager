import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { Module as BModel } from '../../common/bmodel';
import { Module as Switch } from '../../common/switch.component';
import { Module as Checkbox } from '../../common/checkbox.component';
import { Module as Loading } from '../../notification/loading.component';
import { Module as OverrideMode } from '../../common/override-mode.component';
import { Module as Enum } from '../../common/enum.component';
import { Module as ErrorComponent } from '../../error/error.component';
import { Module as Tabs } from '../../common/tabs.component';
import { Module as Selector } from '../../common/selector';
import { Module as TextCheckbox } from '../../common/text-toggle.component';
import { Module as StringList } from '../../common/string-list.component';
import { Module as Tooltip } from '../../common/tooltip.component';
import { Module as AutoFocus } from '../../common/focus';

import { UrlRewriteComponent } from './url-rewrite.component';

//
// Inbound Rules
import { InboundRulesComponent } from './inbound-rules/inbound-rules.component';
import { InboundRuleComponent } from './inbound-rules/inbound-rule.component';
import { InboundRuleEditComponent } from './inbound-rules/inbound-rule-edit';
import { InboundRuleSettingsComponent } from './inbound-rules/inbound-rule-settings';
import { InboundRuleActionComponent } from './inbound-rules/inbound-rule-action';
import { InboundRuleConditionsComponent, InboundRuleConditionComponent, ConditionEditComponent  } from './inbound-rules/inbound-rule-conditions';
import { InboundRuleVariablesComponent, InboundRuleVariableComponent, VariableEditComponent } from './inbound-rules/inbound-rule-variables';

//
// Server Variables
import { ServerVariablesComponent } from './server-variables/server-variables.component';

//
// Outbound Rules
import { OutboundRuleComponent } from './outbound-rules/outbound-rule.component';
import { OutboundRulesComponent } from './outbound-rules/outbound-rules.component';
import { OutboundRuleEditComponent } from './outbound-rules/outbound-rule-edit';
import { OutboundRuleSettingsComponent } from './outbound-rules/outbound-rule-settings';
import { OutboundRuleTypeComponent } from './outbound-rules/outbound-rule-type';

//
// Rewrite Maps
import { RewriteMapsComponent } from './rewrite-maps/rewrite-maps.component';
import { RewriteMapComponent } from './rewrite-maps/rewrite-map.component';
import { RewriteMapEditComponent } from './rewrite-maps/rewrite-map-edit';
import { MappingComponent, MappingEditComponent } from './rewrite-maps/mapping.component';

//
// Providers
import { ProvidersComponent } from './providers/providers.component';
import { ProviderComponent } from './providers/provider.component';
import { ProviderEditComponent } from './providers/provider-edit';
import { SettingComponent, SettingEditComponent } from './providers/setting.component';

import { UrlRewriteService } from './service/url-rewrite.service';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        BModel,
        Switch,
        Checkbox,
        Loading,
        OverrideMode,
        Enum,
        ErrorComponent,
        Tabs,
        Selector,
        TextCheckbox,
        StringList,
        Tooltip,
        AutoFocus,
    ],
    declarations: [
        UrlRewriteComponent,
        InboundRulesComponent,
        InboundRuleComponent,
        InboundRuleEditComponent,
        InboundRuleSettingsComponent,
        InboundRuleActionComponent,
        InboundRuleConditionsComponent,
        InboundRuleConditionComponent,
        ConditionEditComponent,
        InboundRuleVariablesComponent,
        InboundRuleVariableComponent,
        VariableEditComponent,
        ServerVariablesComponent,
        OutboundRuleEditComponent,
        OutboundRuleSettingsComponent,
        OutboundRuleTypeComponent,
        OutboundRuleComponent,
        OutboundRulesComponent,
        RewriteMapsComponent,
        RewriteMapComponent,
        RewriteMapEditComponent,
        MappingComponent,
        MappingEditComponent,
        ProvidersComponent,
        ProviderComponent,
        ProviderEditComponent,
        SettingComponent,
        SettingEditComponent
    ],
    providers: [
        UrlRewriteService
    ]
})
export class UrlRewriteModule { }
