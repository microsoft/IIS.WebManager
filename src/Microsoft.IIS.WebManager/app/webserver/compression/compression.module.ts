import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { Module as BModel } from '../../common/bmodel';
import { Module as Switch } from '../../common/switch.component';
import { Module as Loading } from '../../notification/loading.component';
import { Module as OverrideMode } from '../../common/override-mode.component';
import { Module as ErrorComponent } from '../../error/error.component';
import { FilesModule } from '../../files/files.module';

import { CompressionService } from './compression.service';

import { CompressionComponent } from './compression.component';

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
        FilesModule
    ],
    declarations: [
        CompressionComponent
    ],
    providers: [
        CompressionService
    ]
})
export class CompressionModule { }
