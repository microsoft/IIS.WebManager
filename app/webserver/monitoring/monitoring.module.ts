import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ChartsModule } from 'ng2-charts';

import { Module as BModel } from '../../common/bmodel';
import { Module as Tooltip } from '../../common/tooltip.component';

import { MonitoringComponent } from './monitoring.component';
import { MonitoringService } from './monitoring.service';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        BModel,
        Tooltip,
        ChartsModule
    ],
    declarations: [
        MonitoringComponent,
    ],
    providers: [
        MonitoringService
    ]
})
export class MonitoringModule {
}
