import { NgModule, Inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Module } from '../websites/module';
import { Module as BModel } from '../../common/bmodel';
import { Module as Validators } from '../../common/validators';
import { Module as Switch } from '../../common/switch.component';
import { Module as Sort } from '../../common/sort.pipe';
import { Module as Enum } from '../../common/enum.component';
import { FilesModule } from '../../files/files.module';

import { VdirsService } from './vdirs.service';
import { VdirListComponent, VdirListItem } from './vdir-list.component';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        FilesModule,
        Module,
        BModel,
        Validators,
        Switch,
        Sort,
        Enum
    ],
    declarations: [
        VdirListComponent,
        VdirListItem
    ],
    providers: [
        VdirsService
    ]
})
export class VdirsModule implements OnDestroy {
    constructor(private _svc: VdirsService) { }

    ngOnDestroy() {
        this._svc.destroy();
    }
}