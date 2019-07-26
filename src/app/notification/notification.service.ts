import { Injectable } from '@angular/core';
import { ApiConnection } from '../connect/api-connection';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { ApiError, ApiErrorType } from '../error/api-error';
import { Notification, NotificationType } from './notification';
import { ModalArgs } from './modal';
import { ComponentReference, WarningComponentName } from '../main/settings';

const WarningComponentReference: ComponentReference = { name: WarningComponentName, ico: null, component_name: WarningComponentName, api_name: null, api_path: null }

@Injectable()
export class NotificationService {

    private _modal: Subject<ModalArgs> = new Subject<ModalArgs>();
    private _notifications: BehaviorSubject<Array<Notification>> = new BehaviorSubject<Array<Notification>>([]);
    private _activate: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    public get notifications(): Observable<Array<Notification>> {
        return this._notifications.asObservable();
    }

    public getNotifications(): Array<Notification> {
        return this._data;
    }

    public get modal(): Observable<ModalArgs> {
        return this._modal.asObservable();
    }

    public get activate(): Observable<boolean> {
        return this._activate.asObservable();
    }

    private get _data() {
        return this._notifications.getValue();
    }

    public warn(message: string) {
        let notification: Notification = {
            type: NotificationType.Warning,
            componentName: WarningComponentReference.component_name,
            module: WarningComponentReference,
            data: {
                warning: message
            },
            highPriority: false
        }

        this._data.push(notification);
        this._notifications.next(this._data);
    }

    public confirm(title: string, message: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            let args = new ModalArgs();
            args.title = title;
            args.message = message;

            args.onConfirm = () => { resolve(true) };
            args.onCancel = () => { resolve(false) };

            this._modal.next(args);
        });
    }

    public confirmAsync<T>(
        title: string,
        message: string,
        action: () => Promise<T>,
        rejectOnCancel: boolean = false,
    ): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            this.confirm(title, message).then(confirmed => {
                if (confirmed) {
                    action().then(v => resolve(v)).catch(e => reject(e));
                } else {
                    if (rejectOnCancel) {
                        reject("cancelled");
                    }
                    resolve(null);
                }
            }).catch(e => reject(e));
        });
    }

    public notify(notification: Notification) {
        this._data.push(notification);
        this._notifications.next(this._data);
    }

    public clearWarnings() {
        this._notifications.next(this._data.filter(n => {
            return n.type !== NotificationType.Warning;
        }));
    }

    public show() {
        if (!this._activate.getValue()) {
            this._activate.next(true);
        }
    }

    public hide() {
        if (this._activate.getValue()) {
            this._activate.next(false);
        }        
    }

    public remove(notification: Notification) {
        let index = this._data.findIndex(n => {
            return n === notification;
        });
        if (index >= 0) {
            this._data.splice(index, 1);
            this._notifications.next(this._data);
        }
    }

    public apiError(error: ApiError) {

        if (error.type === ApiErrorType.FeatureNotInstalled) {
            return;
        }

        // Do not show programming error. They will be logged on the console window
        if (error instanceof TypeError) {
            this.warn("An unknown error has occurred while processing your request.");
            return
        }

        let msg = error.message || error.detail;
        if (msg) {
            this.warn(msg);
        }
    }

    public remoteServerCantBeReached(conn: ApiConnection) {
        this.warn("'" + (conn.displayName || conn.hostname()) + "' could not be reached at: " + conn.url);
    }

    public unauthorized() {
        this.warn("Unauthorized");
    }

    public invalidAccessToken() {
        this.warn("Invalid access token");
    }
}
