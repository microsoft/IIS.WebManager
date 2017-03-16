import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {Module as BModel} from '../../common/bmodel';
import {Module as Switch} from '../../common/switch.component';
import {Module as Loading} from '../../notification/loading.component';
import {Module as OverrideMode} from '../../common/override-mode.component';
import {Module as ErrorComponent} from '../../error/error.component';

import {CompressionService} from './compression.service';

import {CompressionComponent} from './compression.component';

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
        CompressionComponent
    ],
    providers: [
        CompressionService
    ]
})
export class CompressionModule { }
