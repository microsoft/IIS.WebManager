import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Module as BModel } from '../common/bmodel';
import { Module as NotFound } from '../common/notfound.component';
import { Module as Selector } from '../common/selector';
import { Module as Loading } from '../notification/loading.component';
import { Module as VirtualList } from '../common/virtual-list.component';

import { CertificatesComponent } from './certificates.component';
import { CertificatesListComponent } from './certificates-list.component';
import { CertificateListItem } from './certificate-list-item';
import { CertificateDetailsComponent } from './certificate-details.component';
import { CertificatesService } from './certificates.service';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        BModel,
        NotFound,
        Selector,
        Loading,
        VirtualList
    ],
    exports: [
        CertificatesComponent,
        CertificatesListComponent,
        CertificateListItem,
        CertificateDetailsComponent
    ],
    declarations: [
        CertificatesComponent,
        CertificatesListComponent,
        CertificateListItem,
        CertificateDetailsComponent
    ],
    providers: [
        CertificatesService
    ]
})
export class CertificatesModule { }
