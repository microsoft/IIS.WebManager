import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Module as BModel } from '../../common/bmodel';
import { Module as NotFound } from '../../common/notfound.component';
import { Module as CheckBox } from '../../common/checkbox.component';
import { Module as Switch } from '../../common/switch.component';
import { Module as Dynamic } from '../../common/dynamic.component';
import { Module as Selector } from '../../common/selector';
import { Module as VTabs } from '../../common/vtabs.component';
import { Module as Loading } from '../../notification/loading.component';
import { Module as Enum } from '../../common/enum.component';
import { Module as StringList } from '../../common/string-list.component';
import { Module as Tabs } from '../../common/tabs.component';
import { Module as AutoFocus } from '../../common/focus';

import { Module } from './module';
import { Routing } from './app-pool.routes';

import { AppPoolComponent } from './app-pool.component';
import { AppPoolGeneralComponent } from './app-pool-general.component';
import { AppPoolHeaderComponent } from './app-pool-header.component';
import { CpuComponent } from './cpu.component';
import { ProcessModelComponent, ProcessOrphaningComponent } from './process.component';
import { RapidFailProtectionComponent } from './rapid-fail-protection.component';
import { DailyScheduleComponent, RecyclingComponent } from './recycling.component';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        Module,
        Routing,
        BModel,
        NotFound,
        CheckBox,
        Switch,
        Dynamic,
        Selector,
        VTabs,
        Loading,
        Enum,
        StringList,
        Tabs,
        AutoFocus,
    ],
    declarations: [
        AppPoolComponent,
        AppPoolGeneralComponent,
        AppPoolHeaderComponent,
        CpuComponent,
        ProcessModelComponent,
        ProcessOrphaningComponent,
        RapidFailProtectionComponent,
        DailyScheduleComponent,
        RecyclingComponent
    ]
})
export class AppPoolsModule { }
