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

import { UrlRewriteComponent } from './url-rewrite.component';

//
// Inbound Rule Components
import { InboundRulesComponent } from './inbound-rule/inbound-rules.component';
import { InboundRuleComponent } from './inbound-rule/inbound-rule.component';
import { InboundRuleEditComponent } from './inbound-rule/inbound-rule-edit';
import { InboundRuleSettingsComponent } from './inbound-rule/inbound-rule-settings';
import { InboundRuleActionComponent } from './inbound-rule/inbound-rule-action';
import { InboundRuleConditionsComponent, InboundRuleConditionComponent, ConditionEditComponent  } from './inbound-rule/inbound-rule-conditions';
import { InboundRuleVariablesComponent, InboundRuleVariableComponent, VariableEditComponent } from './inbound-rule/inbound-rule-variables';

import { UrlRewriteService } from './url-rewrite.service';

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
        TextCheckbox
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
        VariableEditComponent
    ],
    providers: [
        UrlRewriteService
    ]
})
export class UrlRewriteModule { }
