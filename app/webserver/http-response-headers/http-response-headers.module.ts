import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {Module as BModel} from '../../common/bmodel';
import {Module as Switch} from '../../common/switch.component';
import {Module as Loading} from '../../notification/loading.component';
import {Module as OverrideMode} from '../../common/override-mode.component';
import {Module as ErrorComponent} from '../../error/error.component';

import {HttpResponseHeadersService} from './http-response-headers.service';

import {CustomHeadersComponent} from './custom-headers.component';
import {HttpResponseHeadersComponent} from './http-response-headers.component';
import {RedirectHeadersComponent} from './redirect-headers.component';

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
        CustomHeadersComponent,
        HttpResponseHeadersComponent,
        RedirectHeadersComponent
    ],
    providers: [
        HttpResponseHeadersService
    ]
})
export class HttpResponseHeadersModule { }