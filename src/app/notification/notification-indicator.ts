import { Component } from '@angular/core';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '../notification/notification';
import { first } from 'rxjs/operators'

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
        <div class="hover-primary2 nav-button" title="Notifications" *ngIf="_notifications.length > 0" (click)="toggleNotifications()">
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
        this._service.activate.pipe(first()).subscribe(a => {
            active = a;
        })

        active ? this._service.hide() : this._service.show();
    }
}
