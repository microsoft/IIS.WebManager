import {Injectable, Optional} from '@angular/core';
import {RequestMethod} from '@angular/http';
import {Angulartics2GoogleAnalytics} from 'angulartics2/src/providers/angulartics2-ga';
import {HttpClient} from '../common/httpclient';
import {ConnectService} from '../connect/connect.service';
import {SETTINGS} from '../main/settings';
import {NotificationService} from '../notification/notification.service';
import {Notification, NotificationType} from '../notification/notification';
import { ComponentReference, AppModuleName } from '../main/settings';
import { first } from 'rxjs/operators'
import { IntervalObservable } from 'rxjs-compat/observable/IntervalObservable';

const AppModuleReference: ComponentReference = { name: AppModuleName, ico: null, component_name: AppModuleName, api_name: null, api_path: null };

@Injectable()
export class VersionService {


    constructor(private _httpClient: HttpClient,
                private _notificationService: NotificationService,
                private _connectSvc: ConnectService,
                @Optional() private _analytics: Angulartics2GoogleAnalytics) {
                    this.initialize();
                }

    private initialize() {

        let startAfter = 30 * 1000; // 30 seconds
        let interval = 2 * 3600000; // 2 hours

        // Wait for an initial period then check the api version on an interval
        setTimeout(() => {

            if (this.connected()) {
                this.checkVersions();
            }

            IntervalObservable.create(interval).subscribe(_ => {
                if (this.connected()) {
                    this.checkVersions();
                }
            });
        }, startAfter);
    }

    private checkVersions() {
        this.makeApiRequest().then(res => {
            let userApiVersion = this.parseApiVersion(res);
            let latestApiVersion = SETTINGS.api_version;

            if (this.compareVersions(userApiVersion, latestApiVersion) < 0 && !this.notificationExists()) {

                this._notificationService.notify({
                    type: NotificationType.Information,
                    componentName: "NewVersionNotificationComponent",
                    module: AppModuleReference,
                    data: {
                        version: SETTINGS.api_setup_version
                    },
                    highPriority: true
                });
            }
            if (this._analytics) {
                let properties = {
                    category: "API_Version",
                    action: "Using",
                    label: userApiVersion
                }
                this._analytics.eventTrack("Using", properties);
            }
        });
    }

    private notificationExists(): boolean {
        let notifications: Notification[];
        let sub = this._notificationService.notifications.pipe(first()).subscribe(n => {
            notifications = n;
        });
        
        return !!notifications.find(n => {
            return n.componentName === "NewVersionNotificationComponent";
        });
    }
    
    private compareVersions(a: string, b: string) {
        let aParts = a.split('.');
        let bParts = b.split('.');

        if (aParts.length != bParts.length) {
            throw "Invalid version format.";
        }

        for (let i = 0; i < aParts.length; i++) {
            let aI = parseInt(aParts[i]);
            let bI = parseInt(bParts[i]);

            if (aI != bI) {
                return aI - bI;
            }
        }
        return 0;
    }

    private parseApiVersion(res: any) {
        const VERSION_PREFIX = "application/vnd.Microsoft.WebServer.Api.";
        const couldntGetVersion = "Could not get API version.";

        if (!res.headers.get("Content-Type")) {
            throw couldntGetVersion;
        }

        let apiContentType = res.headers.get("Content-Type")

        if (apiContentType.indexOf(VERSION_PREFIX) !== 0) {
            throw couldntGetVersion;
        }

        let part = apiContentType.substring(VERSION_PREFIX.length);
        const suffix = ".application/";

        if (part.indexOf(suffix) === -1) {
            throw couldntGetVersion;
        }

        // Version (e.g. 1.0.1)
        return part.substr(0, part.indexOf(suffix));
    }

    private makeApiRequest(): Promise<any> {
        let opts = this._httpClient.getOptions(RequestMethod.Get, "/", null);
        return this._httpClient.request("/", opts);
    }

    private connected() {
        let connection = null;
        this._connectSvc.active.pipe(first()).subscribe(c => {
            connection = c;
        });
        return connection != null;
    }
}
