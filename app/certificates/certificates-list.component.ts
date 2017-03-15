/// <reference path="../../node_modules/@angular/core/src/core.d.ts" />

import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';

import {DateTime} from '../common/primitives';
import {Certificate} from './certificate';
import {CertificatesService} from './certificates.service';


@Component({
    selector: 'certificates-list',
    styles: [`
        .grid-item:hover {
            cursor: pointer;
        }

        li > div {
            overflow: hidden;
            text-overflow: ellipsis;
        }

        li {
            line-height: 30px;
        }

        .grid-item small {
            font-size: 11px;
            padding-left: 22px;
            font-weight: normal;
            display: block;
            line-height: 10px;
            margin-top: -5px;
        }

        .name {
            font-size: 16px;
        }

        .name:before {
            font-family: FontAwesome;
            content: "\\f023";
            padding-left: 5px;
            padding-right: 5px;
            font-size: 16px;
        }

        [class*="col-"] {
            padding-left: 0;
        }
    `],
    template: `
        <loading *ngIf="!certs"></loading>
        <div *ngIf="certs" class="container-fluid">
            <div class="border-active grid-list-header row hidden-xs" [hidden]="certs.length == 0">
                <label class="col-xs-12 col-sm-6  col-md-4 col-lg-3">Name</label>
                <label class="col-xs-3 col-md-4 col-lg-3 hidden-xs hidden-sm">Issued By</label>
                <label class="col-lg-3 hidden-xs hidden-sm hidden-md">Valid To</label>
                <label class="col-sm-6 col-md-4 col-lg-3 hidden-xs">Thumbprint</label>
            </div>
            <ul class="grid-list">
                <li *ngFor="let cert of certs" (click)="selectCert(cert, $event)" class="hover-editing grid-item row">
                    <div class="col-xs-12 col-sm-6  col-md-4 col-lg-3">
                        <span class='name'>{{cert.name}}</span>
                        <small class="visible-xs color-accent">{{cert.thumbprint}}</small>
                    </div>
                    <div class="col-xs-3 col-md-4 col-lg-3 hidden-xs hidden-sm">
                        <span>{{friendlyIssuedBy(cert)}}</span>
                    </div>
                    <div class="col-lg-3 hidden-xs hidden-sm hidden-md">
                        <span>{{friendlyValidTo(cert)}}</span>
                    </div>
                    <div class="col-sm-6 col-md-4 col-lg-3 hidden-xs">
                        <span>{{cert.thumbprint}}</span>
                    </div>
                </li>
            </ul>
        </div>
    `,
    providers: [
        CertificatesService
    ]
})
export class CertificatesListComponent implements OnInit {
    certs: Array<Certificate>;

    @Output() itemSelected: EventEmitter<any> = new EventEmitter();

    @Input()
    lazy: boolean;

    constructor(private _service: CertificatesService) {
    }

    ngOnInit() {
        if (!this.lazy) {
            this.activate();
        }
    }

    activate(): Promise<any> {
        return this._service.getAll()
            .then(certs => this.certs = certs);
    }

    selectCert(cert, evt) {        
        this.itemSelected.emit(cert);
    }

    friendlyValidTo(cert: Certificate) {
        if (!cert.valid_to) {
            return "";
        }
            
        return cert.valid_to.substring(0, 10);
    }

    isExpired(cert: Certificate): boolean {
        return DateTime.UtcNow > new Date(cert.valid_to);
    }

    friendlyIssuedBy(cert: Certificate) {
        if (!cert.issued_by) {
            return "";
        }

        if (cert.issued_by.indexOf("CN=") == 0) {
            return cert.issued_by.substring(3, cert.issued_by.length);
        }

        return cert.issued_by;
    }
}