import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { Module as Selector } from '../../common/selector';
import { Module as Switch } from '../../common/switch.component';
import { Module as Enum } from '../../common/enum.component';

import { Module as AppPoolModule } from '../app-pools/module';

import { NavigatorComponent } from './navigator.component';
import { AppPoolDetailsComponent } from './app-pool-details';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        RouterModule,
        AppPoolModule,
        Selector,
        Switch,
        Enum
    ],
    exports: [
        NavigatorComponent,
        AppPoolDetailsComponent
    ],
    declarations: [
        NavigatorComponent,
        AppPoolDetailsComponent
    ]
})
export class Module { }
