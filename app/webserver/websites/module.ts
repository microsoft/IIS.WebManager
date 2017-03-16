import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {Module as Selector} from '../../common/selector';

import {NavigatorComponent} from './navigator.component';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        Selector
    ],
    exports: [
        NavigatorComponent
    ],
    declarations: [
        NavigatorComponent
    ]
})
export class Module { }
