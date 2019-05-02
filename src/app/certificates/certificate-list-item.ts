import { Component, Input } from '@angular/core';
import { Certificate } from './certificate';

enum ViewState {
    closed = 0, open,
}

const viewStates = [
    { icon: "more", title: "More..." },
    { icon: "less", title: "less..." },
]

@Component({
    selector: 'certificate',
    template: `
        <div *ngIf="model" class="grid-item row" tabindex="-1">
            <div *ngIf="!viewing" class="row-data">
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
                <button class="list-action-button {{detailsButtonIcon}}" title="{{detailsButtonTitle}}" (click)="onDetails($event)"></button>
            </div>
            <certificate-details *ngIf="viewing" [model]="model"></certificate-details>
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
    `]
})
export class CertificateListItem {
    @Input() model: Certificate;
    private _viewing: ViewState = ViewState.closed;

    public toggleView() {
        this._viewing = 1 - this._viewing;
    }

    get viewing() {
        return this._viewing;
    }

    get detailsButtonIcon() {
        return viewStates[this.viewing].icon;
    }

    get detailsButtonTitle() {
        return viewStates[this.viewing].title;
    }

    get validTo() {
        return Certificate.friendlyValidTo(this.model);
    }

    get issuedBy() {
        return Certificate.friendlyIssuedBy(this.model);
    }

    get displayName() {
        return Certificate.displayName(this.model);
    }

    onDetails(e: Event) {
        e.preventDefault();
        this.toggleView();
    }

    prevent(e: Event) {
        e.preventDefault();
    }

    openSelector(e: Event) {
        e.preventDefault();
    }
}
