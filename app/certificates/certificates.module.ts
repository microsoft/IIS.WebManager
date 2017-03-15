import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {Module as NotFound} from '../common/notfound.component';
import {Module as Loading} from '../notification/loading.component';

import {CertificatesListComponent} from './certificates-list.component';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        NotFound,
        Loading
    ],
    exports: [
        CertificatesListComponent
    ],
    declarations: [
        CertificatesListComponent
    ]
})
export class CertificatesModule { }