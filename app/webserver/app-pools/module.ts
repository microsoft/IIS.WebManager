import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {Module as BModel} from '../../common/bmodel';
import {Module as Validators} from '../../common/validators';
import {Module as Switch} from '../../common/switch.component';
import {Module as Loading} from '../../notification/loading.component';
import {Module as Sort} from '../../common/sort.pipe';
import {Module as Selector} from '../../common/selector';
import {Module as Enum} from '../../common/enum.component';

import {AppPoolList, AppPoolItem} from './app-pool-list';
import {AppPoolListComponent} from './app-pool-list.component';
import {NewAppPoolComponent} from './new-app-pool.component';
import {IdentityComponent} from './identity.component';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        BModel,
        Validators,
        Switch,
        Loading,
        Sort,
        Selector,
        Enum
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
