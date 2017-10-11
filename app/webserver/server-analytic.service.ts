declare var SETTINGS: any; 

import { Injectable, OnDestroy } from '@angular/core';
import { Angulartics2GoogleAnalytics } from 'angulartics2/src/providers/angulartics2-ga';

import { Subscription } from 'rxjs/Subscription';

import { HttpClient } from '../common/httpclient';
import { ApiConnection } from '../connect/api-connection';
import { ConnectService } from '../connect/connect.service';
import { Notification, NotificationType } from '../notification/notification';


@Injectable()
export class ServerAnalyticService implements OnDestroy {

    private _subscriptions: Array<Subscription> = [];

    constructor(private _httpClient: HttpClient,
        private _connectSvc: ConnectService)
    {
        this._subscriptions.push(this._connectSvc.active.subscribe(c => {
            if (c != null) {
                this.getServerId(c);
            }
        }));
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(sub => {
            sub.unsubscribe();
        })
    }

    private get gaTrackCode() {
        return SETTINGS && SETTINGS.ga_track;
    }

    private getServerId(connection: ApiConnection) {

        let clientId: string = (<any>connection)._hostId;

        if (clientId) {
            this.setupAnalytics(clientId);
        }
        else {
            this._httpClient.get("/webserver").then(res => {

                clientId = res.id;

                (<any>connection)._hostId = clientId;

                this.setupAnalytics(clientId);
            })
            .catch(e => {
                // NoOp
            });
        }
    }

    private setupAnalytics(clientId: string): void {
        (function (i, s, o, g, r, a, m) {
            i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function () {
                (i[r].q = i[r].q || []).push(arguments)
            }, i[r].l = 1 * (<any>(new Date())); a = s.createElement(o),
                m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)
        })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga', null, null);

        let ga = (<any>window).ga;

        //
        // Create ga using hash of IIS Administration webserver id
        ga('create', this.gaTrackCode, {
            storage: "none",
            clientId: clientId,
            storeGac: false
        });

        //
        // Anonymize
        ga('set', 'anonymizeIp', true);
    }
}
