import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { Module as BModel } from '../../common/bmodel';
import { Module as CheckBox } from '../../common/checkbox.component';
import { Module as Switch } from '../../common/switch.component';
import { Module as Loading } from '../../notification/loading.component';
import { Module as OverrideMode } from '../../common/override-mode.component';
import { Module as ErrorComponent } from '../../error/error.component';
import { Module as Enum } from '../../common/enum.component';
import { Module as Tooltip } from '../../common/tooltip.component';
import { Module as Selector } from '../../common/selector';

import { AuthorizationService } from './authorization.service';

import { AuthorizationComponent } from './authorization.component';
import { RulesComponent } from './rules.component';
import { RuleComponent } from './rule.component';
import { RuleEditComponent } from './rule-edit.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        BModel,
        CheckBox,
        Switch,
        Loading,
        OverrideMode,
        ErrorComponent,
        Enum,
        Tooltip,
        Selector
    ],
    declarations: [
        AuthorizationComponent,
        RulesComponent,
        RuleComponent,
        RuleEditComponent
    ],
    providers: [
        AuthorizationService
    ]
})
export class AuthorizationModule { }
