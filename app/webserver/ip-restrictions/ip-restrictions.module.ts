import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {Module as BModel} from '../../common/bmodel';
import {Module as Switch} from '../../common/switch.component';
import {Module as Loading} from '../../notification/loading.component';
import {Module as OverrideMode} from '../../common/override-mode.component';
import {Module as ErrorComponent} from '../../error/error.component';

import {IpRestrictionsService} from './ip-restrictions.service';

import {DynamicRestrictionsComponent} from './dynamic-restrictions.component';
import {IpAddressesComponent} from './ip-addresses.component';
import {IpRestrictionsComponent} from './ip-restrictions.component';
import {RestrictionRuleComponent} from './restriction-rules.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        BModel,
        Switch,
        Loading,
        OverrideMode,
        ErrorComponent
    ],
    declarations: [
        DynamicRestrictionsComponent,
        IpAddressesComponent,
        IpRestrictionsComponent,
        RestrictionRuleComponent
    ],
    providers: [
        IpRestrictionsService
    ]
})
export class IpRestrictionsModule { }
