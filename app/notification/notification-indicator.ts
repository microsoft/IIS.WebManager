import { Component, Input } from '@angular/core';
import { NotificationComponent } from './notification.component';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '../notification/notification';

import 'rxjs/add/operator/first';

@Component({
    selector: 'notification-indicator',
    styles: [`
        div {
            display: inline-block;
            vertical-align: middle;
            min-width: 25px;
            cursor: pointer;
        }
    `],
    template: `
        <div *ngIf="_notifications.length > 0" (click)="toggleNotifications()" title="Notifications">
            <i class="fa fa-bell"></i>
            {{_notifications.length}}
        </div>
    `
})
export class NotificationIndicator {
    private _notifications = [];

    constructor(private _service: NotificationService) {
        this._service.notifications.subscribe(notifications => {
            this._notifications = notifications.filter(notification => {
                return notification.type === NotificationType.Information;
            });
        });
    }

    toggleNotifications() {
        let active: boolean;
        this._service.activate.first().subscribe(a => {
            active = a;
        })

        active ? this._service.hide() : this._service.show();
    }
}