import { Component, Input } from '@angular/core';
import { Certificate } from './certificate';

@Component({
    selector: 'certificate-details',
    template: `
        <div *ngIf="model">
            <div class="inline-block">
                <fieldset>
                    <label>Alias</label>
                    <span>{{model.friendly_name || model.alias}}</span>
                </fieldset>
                <fieldset>
                    <label>Subject</label>
                    <span>{{model.subject}}</span>
                </fieldset>
                <fieldset>
                    <label>Issued By</label>
                    <span>{{model.issued_by}}</span>
                </fieldset>
                <fieldset>
                    <label>Thumbprint</label>
                    <span>{{model.thumbprint}}</span>
                </fieldset>
            </div>
            <div class="inline-block">
                <fieldset>
                    <label>Valid To</label>
                    <span>{{validTo}}</span>
                </fieldset>
                <fieldset>
                    <label>Valid From</label>
                    <span>{{validFrom}}</span>
                </fieldset>
                <fieldset>
                    <label>Signature Algorithm</label>
                    <span>{{model.hash_algorithm || model.signature_algorithm}}</span>
                </fieldset>
                <fieldset>
                    <label>Certificate Store</label>
                    <span>{{!(model.store) ? "" : model.store.name}}</span>
                </fieldset>
            </div>
            <div class="inline-block">
                <fieldset>
                    <label>Subject Alternative Names</label>
                    <ul *ngIf="model.subject_alternative_names">
                        <li *ngFor="let san of model.subject_alternative_names">
                            {{san}}
                        </li>
                    </ul>
                </fieldset>
                <fieldset>
                    <label>Intended Purposes</label>
                    <ul *ngIf="model.intended_purposes">
                        <li *ngFor="let purpose of model.intended_purposes">
                            {{purpose}}
                        </li>
                    </ul>
                </fieldset>
            </div>
        </div>
    `,
    styles: [`
        span {
            display: block;
        }

        .inline-block {
            width: 400px;
            overflow: hidden;
        }

        div {
            vertical-align: top;
        }

        fieldset label {
            margin-bottom: 5px;
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
