import { Component, Input } from '@angular/core';
import { ApplicationPool } from './app-pool';

@Component({
    selector: 'app-pool-header',
    template: `
        <div class="feature-header" *ngIf="pool">
            <div class="feature-title sme-focus-zone">
                <h1 [ngClass]="pool.status">{{pool.name}}</h1>
                <span class="status" *ngIf="pool.status == 'stopped'">{{pool.status}}</span>
            </div>
        </div>
    `,
    styles: [`
        .feature-title h1:before {
            content: "\\f085";
        }

        .status {
            display: block;
            text-align: right;
        }
    `]
})
export class AppPoolHeaderComponent {
    @Input() pool: ApplicationPool;
}
