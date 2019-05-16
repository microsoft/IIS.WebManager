import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { Module as BModel } from '../../common/bmodel';
import { Module as Validators } from '../../common/validators';
import { Module as Switch } from '../../common/switch.component';
import { Module as Loading } from '../../notification/loading.component';
import { Module as Sort } from '../../common/sort.pipe';
import { Module as Selector } from '../../common/selector';
import { Module as Enum } from '../../common/enum.component';
import { Module as AutoFocus } from '../../common/focus';
import { AppPoolList, AppPoolItem } from './app-pool-list';
import { AppPoolListComponent } from './app-pool-list.component';
import { NewAppPoolComponent } from './new-app-pool.component';
import { IdentityComponent } from './identity.component';
import { ListModule } from 'common/list';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        RouterModule,
        BModel,
        Validators,
        Switch,
        Loading,
        Sort,
        Selector,
        Enum,
        AutoFocus,
        ListModule,
    ],
    exports: [
        AppPoolList,
        AppPoolItem,
        AppPoolListComponent,
        NewAppPoolComponent,
        IdentityComponent

    ],
    declarations: [
        AppPoolList,
        AppPoolItem,
        AppPoolListComponent,
        NewAppPoolComponent,
        IdentityComponent
    ]
})
export class Module { }
