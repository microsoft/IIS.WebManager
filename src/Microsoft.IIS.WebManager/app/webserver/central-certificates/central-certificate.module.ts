import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { FilesModule } from '../../files/files.module';
import { CertificatesModule } from '../../certificates/certificates.module';
import { Module as BModel } from '../../common/bmodel';
import { Module as Switch } from '../../common/switch.component';
import { Module as Loading } from '../../notification/loading.component';
import { Module as OverrideMode } from '../../common/override-mode.component';
import { Module as ErrorComponent } from '../../error/error.component';
import { Module as Sort } from '../../common/sort.pipe';
import { Module as Validators } from '../../common/validators';

import { CentralCertificateService } from './central-certificate.service';

import { CentralCertificateComponent } from './central-certificate.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        FilesModule,
        CertificatesModule,
        BModel,
        Switch,
        Loading,
        Sort,
        Validators,
        OverrideMode,
        ErrorComponent
    ],
    declarations: [
        CentralCertificateComponent
    ],
    providers: [
        CentralCertificateService
    ]
})
export class CentralCertificateModule { }
