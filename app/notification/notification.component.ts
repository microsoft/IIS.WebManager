import { Component, OnDestroy, ViewChildren, QueryList } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs/src/subscription';
import { NotificationService } from './notification.service';
import { Notification, NotificationType } from './notification';

import { ArrayUtil } from '../utils/array';
import { DynamicComponent } from '../common/dynamic.component';

@Component({
    selector: 'notifications',
    exportAs: 'notifications',
    styles: [`
        .notifications {
            width: 100%;
            position: absolute;
            top: 0;
            margin-top: 55px;
            color: #444;
            overflow: hidden;
            font-size:16px;
        }
        .exit {
            cursor: pointer;
            position: absolute;
            right: 15px;
            top: 10px;
            font-size: 120%;
        }
        .entry {
            position:relative;
            border-bottom-width: 1px;
            border-bottom-style: solid;
            white-space: normal;
        }
    `],
    template: `
        <div class="notifications shadow">
            <div *ngIf="_warning" class="entry warning border-active">
                <i class="fa fa-times exit" (click)="clearWarning()" title="Dismiss"></i>
                <dynamic [name]="_warning.componentName" [module]="_warning.module" [data]="_warning.data" [eager]="true"></dynamic>
            </div>
            <div *ngIf="_active">
                <div *ngFor="let notification of _notifications; let i = index;" class="entry background-normal border-active">
                    <i class="fa fa-times exit" (click)="dismiss(i)" title="Dismiss"></i>
                    <dynamic [name]="notification.componentName" [module]="notification.module" [data]="notification.data" [eager]="true"></dynamic>
                </div>
            </div>
        </div>
    `
})
export class NotificationComponent implements OnDestroy {

    private _warning: Notification;
    private _notifications: Array<Notification> = [];

    private _active: boolean;
    private _subscriptions: Subscription[] = [];

    @ViewChildren(DynamicComponent) private _dynamics: QueryList<DynamicComponent>;

    constructor(private _service: NotificationService, private _router: Router) {
        this.initialize();
    }

    private initialize() {

        this._subscriptions.push(this._service.notifications.subscribe(notifications => {

            this._notifications = notifications.filter(notification => {
                return notification.type == NotificationType.Information;
            });

            // Get warning
            let warnings = notifications.filter(not => not.type == NotificationType.Warning);
            this._warning = warnings.length > 0 ? warnings[warnings.length - 1] : null;
            this.rebindWarning();
        }));

        this._subscriptions.push(this._service.activate.subscribe(a => {
            this._active = a;
        }));

        //
        // Hide whenever the user navigates
        this._subscriptions.push(this._router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                this._service.hide();
            }
        }));
    }

    public toggle() {
        this._active = !this._active;
    }

    private clearWarning() {
        this._service.remove(this._warning);
        this._service.clearWarnings();
    }

    private dismiss(index: number) {
        this._service.remove(this._notifications[index]);
    }

    public ngOnDestroy() {
        while (this._subscriptions.length > 0) {
            this._subscriptions.pop().unsubscribe();
        }
    }

    private rebindWarning() {
        if (this._dynamics && this._warning) {
            for (var dynamic of this._dynamics.toArray()) {
                if (dynamic.name == this._warning.componentName) {
                    dynamic.rebind(this._warning.data);
                }
            }
        }
    }
}
