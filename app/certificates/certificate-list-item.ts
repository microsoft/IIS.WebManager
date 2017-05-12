import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { Selector } from '../common/selector';
import { DateTime } from '../common/primitives';
import { Certificate } from './certificate';

@Component({
    selector: 'certificate',
    template: `
        <div *ngIf="model" class="grid-item row" tabindex="-1">
            <div *ngIf="!_viewing" class="row-data">
                <div class="visible-xs col-xs-9 col-data cer">
                    <label>Name</label>
                    <span>{{displayName}}</span>
                    <label>Valid To</label>
                    <span>{{validTo}}</span>
                </div>
                <div class="col-xs-12 col-sm-6 col-md-4 col-lg-3 hidden-xs cer">
                    <span class='name'>{{displayName}}</span>
                </div>
                <div class="col-xs-4 col-md-4 col-lg-3 hidden-xs support">
                    <span>{{model.subject}}</span>
                </div>
                <div class="col-xs-2 col-lg-2 hidden-xs hidden-sm support">
                    <span>{{issuedBy}}</span>
                </div>
                <div class="col-lg-1 col-md-1 hidden-xs hidden-sm support">
                    <span>{{model.store && model.store.name}}</span>
                </div>
                <div class="col-lg-2 hidden-xs hidden-sm hidden-md support">
                    <span>{{validTo}}</span>
                </div>
            </div>
            <div class="actions">
                <div class="selector-wrapper">
                    <button title="More" (click)="openSelector($event)" (dblclick)="prevent($event)" [class.background-active]="(_selector && _selector.opened) || false">
                        <i class="fa fa-ellipsis-h"></i>
                    </button>
                    <selector [right]="true">
                        <ul>
                            <li><button *ngIf="!_viewing" class="edit" title="Details" (click)="onDetails($event)">Details</button></li>
                            <li><button  *ngIf="_viewing" class="cancel" title="Close" (click)="onDetails($event)">Close</button></li>
                        </ul>
                    </selector>
                </div>
            </div>
            <certificate-details *ngIf="_viewing" [model]="model"></certificate-details>
        </div>
    `,
    styles: [`
        [class*="col-"] {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .visible-xs span {
            display: block;
        }

        .visible-xs span:not(:last-of-type) {
            margin-bottom: 10px;
        }

        .row {
            margin: 0px;
        }

        .row-data {
            line-height: 30px;
        }

        .col-data {
            line-height: 20px;
        }

        .cer {
            padding-left: 0;
        }

        .support {
            font-size: 85%;
        }

        .selector-wrapper {
            position: relative;
            line-height: 22px;
        }

        selector {
            position:absolute;
            right:0;
            top: 32px;
        }

        selector button {
            min-width: 125px;
            width: 100%;
        }
    `]
})
export class CertificateListItem {
    @Input() model: Certificate;
    private _viewing: boolean;
    @ViewChild(Selector) private _selector: Selector;

    private get validTo() {
        return Certificate.friendlyValidTo(this.model);
    }

    private get issuedBy() {
        return Certificate.friendlyIssuedBy(this.model);
    }

    private get displayName() {
        return Certificate.displayName(this.model);
    }

    private onDetails(e: Event) {
        e.preventDefault();
        this._selector.close();

        this._viewing = !this._viewing;
    }

    private prevent(e: Event) {
        e.preventDefault();
    }

    private openSelector(e: Event) {
        e.preventDefault();
        this._selector.toggle();
    }
}
