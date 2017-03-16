
import {Component} from '@angular/core';

@Component({
    selector: 'notification',
    styles: [`
        .message {
            text-align: center;
        }
    `],
    template: `
        <div *ngIf="notification">
            <p *ngFor="let line of getLines(_warning)">
                {{line}}
            </p>
        </div>
    `
})
export class InformationComponent {
    notification: string;

    getLines() {
        return this.notification.split("\n");
    }
}
