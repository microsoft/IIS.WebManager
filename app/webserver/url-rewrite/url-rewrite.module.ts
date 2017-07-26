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

import { UrlRewriteComponent } from './url-rewrite.component';
import { InboundRuleEditComponent } from './inbound-rule/inbound-rule-edit';
import { InboundRuleSettingsComponent } from './inbound-rule/inbound-rule-settings';
import { InboundRuleActionComponent } from './inbound-rule/inbound-rule-action';
import { InboundRuleConditionsComponent, InboundRuleConditionComponent, ConditionEditComponent  } from './inbound-rule/inbound-rule-conditions';
import { InboundRuleVariablesComponent, InboundRuleVariableComponent } from './inbound-rule/inbound-rule-variables';

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
        Selector
    ],
    declarations: [
        UrlRewriteComponent,
        InboundRuleEditComponent,
        InboundRuleSettingsComponent,
        InboundRuleActionComponent,
        InboundRuleConditionsComponent,
        InboundRuleConditionComponent,
        ConditionEditComponent,
        InboundRuleVariablesComponent,
        InboundRuleVariableComponent
    ]
})
export class UrlRewriteModule { }
