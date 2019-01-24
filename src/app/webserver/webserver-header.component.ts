import { Component, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { WebServer } from './webserver';

@Component({
    selector: 'webserver-header',
    template: `
        <div class="feature-header">
            <div class="feature-title sme-focus-zone">
                <h1 [ngClass]="model.status">Web Server</h1>
                <span class="status" *ngIf="model.status.startsWith('stop')">{{model.status}}</span>
            </div>
        </div>
    `,
    styles: [`
        .feature-title h1:before {
            content: "\\f233";
        }

        .status {
            display: block;
            text-align: right;
        }
    `]
})
export class WebServerHeaderComponent {
    @Input() model: WebServer;
}
