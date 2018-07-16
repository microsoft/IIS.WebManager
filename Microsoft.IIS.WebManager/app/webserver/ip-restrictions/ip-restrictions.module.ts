import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { Module as BModel } from '../../common/bmodel';
import { Module as Switch } from '../../common/switch.component';
import { Module as Loading } from '../../notification/loading.component';
import { Module as OverrideMode } from '../../common/override-mode.component';
import { Module as ErrorComponent } from '../../error/error.component';
import { Module as Tabs } from '../../common/tabs.component';
import { Module as Enum } from '../../common/enum.component';

import { IpRestrictionsService } from './ip-restrictions.service';

import { DynamicRestrictionsComponent } from './dynamic-restrictions.component';
import { IpAddressesComponent } from './ip-addresses.component';
import { IpRestrictionsComponent } from './ip-restrictions.component';
import { RestrictionRuleComponent, RestrictionRulesComponent } from './restriction-rules.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        BModel,
        Switch,
        Loading,
        OverrideMode,
        ErrorComponent,
        Tabs,
        Enum
    ],
    declarations: [
        DynamicRestrictionsComponent,
        IpAddressesComponent,
        IpRestrictionsComponent,
        RestrictionRuleComponent,
        RestrictionRulesComponent
    ],
    providers: [
        IpRestrictionsService
    ]
})
export class IpRestrictionsModule { }
