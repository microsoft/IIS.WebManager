import { Component, Input } from '@angular/core';
import { WebSite } from './site';


@Component({
    selector: 'website-header',
    template: `
        <div class="feature-header" *ngIf="site">
            <div class="feature-title sme-focus-zone">
                <h1 [ngClass]="site.status">{{site.name}}</h1>
                <span class="status" *ngIf="site.status == 'stopped'">{{site.status}}</span>
            </div>
        </div>
    `,
    styles: [`
        .feature-title h1:before {
            content: "\\f0ac";
        }

        .status {
            display: block;
            text-align: right;
        }
    `]
})
export class WebSiteHeaderComponent {
    @Input() site: WebSite;
}
