import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {Module as BModel} from '../../common/bmodel';
import {Module as Switch} from '../../common/switch.component';
import {Module as Loading} from '../../notification/loading.component';
import {Module as OverrideMode} from '../../common/override-mode.component';
import {Module as Enum} from '../../common/enum.component';
import {Module as ErrorComponent} from '../../error/error.component';

import {ModuleService} from './modules.service';

import {ModuleListComponent} from './module-list.component';
import {ModuleComponent} from './module.component';
import {ModulesComponent} from './modules.component';
import {NewModuleComponent} from './new-module.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        BModel,
        Switch,
        Loading,
        OverrideMode,
        Enum,
        ErrorComponent
    ],
    declarations: [
        ModuleListComponent,
        ModuleComponent,
        ModulesComponent,
        NewModuleComponent
    ],
    providers: [
        ModuleService
    ]
})
export class ModulesModule { }