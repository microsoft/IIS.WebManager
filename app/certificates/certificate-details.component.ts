import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { DateTime } from '../common/primitives';
import { Certificate } from './certificate';

@Component({
    selector: 'certificate-details',
    template: `
        <div *ngIf="model">
            <div>
                <label>Alias</label>
                <span>{{model.friendly_name || model.alias}}</span>
            </div>
            <div>
                <label>Subject</label>
                <span>{{model.subject}}</span>
            </div>
            <div>
                <label>Thumbprint</label>
                <span>{{model.thumbprint}}</span>
            </div>
            <div>
                <label>Issued By</label>
                <span>{{model.issued_by}}</span>
            </div>
            <div>
                <label>Valid To</label>
                <span>{{validTo}}</span>
            </div>
            <div>
                <label>Valid From</label>
                <span>{{validFrom}}</span>
            </div>
            <div>
                <label>Signature Algorithm</label>
                <span>{{model.hash_algorithm || model.signature_algorithm}}</span>
            </div>
            <div>
                <label>Certificate Store</label>
                <span>{{!(model.store) ? "" : model.store.name}}</span>
            </div>
            <div>
                <label>Subject Alternative Names</label>
                <ul *ngIf="model.subject_alternative_names">
                    <li *ngFor="let san of model.subject_alternative_names">
                        {{san}}
                    </li>
                </ul>
            </div>
            <div>
                <label>Intended Purposes</label>
                <ul *ngIf="model.intended_purposes">
                    <li *ngFor="let purpose of model.intended_purposes">
                        {{purpose}}
                    </li>
                </ul>
            </div>
        </div>
    `,
    styles: [`
        label {
            min-width: 150px;
        }

        div {
            line-height: 30px;
        }
    `]
})
export class CertificateDetailsComponent {
    @Input() model: Certificate;

    private get validTo() {
        return Certificate.friendlyValidTo(this.model);
    }

    private get validFrom() {
        return Certificate.friendlyValidFrom(this.model);
    }

    private get displayName() {
        return Certificate.displayName(this.model);
    }
}
