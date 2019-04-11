import { Injectable } from '@angular/core';
import { Subscription, interval } from "rxjs";
import { HttpClient } from '../../common/http-client';
import { ServerSnapshot } from './server-snapshot';

@Injectable()
export class MonitoringService {
    public apiInstalled: boolean = true;

    private _requestInterval: number = 1000;
    private _subscribers: Map<number, (ServerSnapshot: ServerSnapshot) => void> = new Map<number, (ServerSnapshot: ServerSnapshot) => void>();
    private _subscription: Subscription = null;
    private _active = true;

    constructor(private _http: HttpClient) {
    }

    public getSnapshot(): Promise<ServerSnapshot> {
        return this._http.get("/webserver/monitoring", null, false)
            .catch(e => {
                if (e.status == 404) {
                    this.apiInstalled = false;
                }

                throw e;
            });
    }

    public subscribe(func: (ServerSnapshot: ServerSnapshot) => void): number {

        let subscriptionId = this._subscribers.size;

        this._subscribers.set(subscriptionId, func);

        if (this._subscription == null) {

            this.setupPollingSubscription();

        }

        return subscriptionId;
    }

    public unsubscribe(subscriptionId: number) {

        this._subscribers.set(subscriptionId, null);

        let stillSubscribers = false;

        this._subscribers.forEach(sub => {

            if (sub) {

                stillSubscribers = true;

            }

        })

        if (!stillSubscribers && this._subscription) {

            this._subscribers.clear();

            this._subscription.unsubscribe();

        }
    }

    public activate(): void {

        this._active = true;

        if (this._subscribers.size > 0) {
            this.setupPollingSubscription();
        }
    }

    public deactivate(): void {

        this._active = false;

        if (this._subscription) {

            this._subscription.unsubscribe();
        }
    }

    private setupPollingSubscription(): void {

        let requesting = false;

        this._subscription = interval(this._requestInterval).subscribe(() => {

            if (!this.apiInstalled || !this._active) {
                return;
            }

            if (!requesting) {

                requesting = true;

                this.getSnapshot()
                    .then(snapshot => {

                        requesting = false;

                        this._subscribers.forEach(callback => callback(snapshot));

                    })
                    .catch(e => {

                        requesting = false;
                        throw e;

                    });
            }
        })

    }
}
