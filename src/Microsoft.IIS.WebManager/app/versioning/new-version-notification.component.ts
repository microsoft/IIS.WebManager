import { Component } from '@angular/core';
import { NotificationService } from '../notification/notification.service';

@Component({
    selector: 'new-version',
    styles: [`
        div {
            min-height: 80px;
            line-height: 80px;
            text-align: center;
            padding-left: 30px;
            padding-right: 30px;
        }

        span {
            vertical-align: middle;
            line-height: normal;
            display: inline-block;
        }
    `],
    template: `
        <div>
            <span>Version {{version}} is now available. <br/> <a [routerLink]="['/get']" (click)="onNavigate()">Click here</a> to get it.</span>
        </div>
    `
})
export class NewVersionNotificationComponent {
    version: string;

    constructor(private _notificationService: NotificationService) {
    }

    private onNavigate(): void {
        this._notificationService.remove(this._notificationService.getNotifications().find(n => n.componentName == 'NewVersionNotificationComponent'));
    }
}
