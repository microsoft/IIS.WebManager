import { Injectable, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Logging } from './logging';
import { Status } from '../../common/status';
import { HttpClient } from '../../common/httpclient';
import { ApiFile, ChangeType } from '../../files/file';
import { IDisposable } from '../../common/idisposable';
import { FilesService } from '../../files/files.service';
import { ApiError, ApiErrorType } from '../../error/api-error';
import { WebSitesService } from '../websites/websites.service';
import { NotificationService } from '../../notification/notification.service';

@Injectable()
export class LoggingService implements IDisposable {
    public error: ApiError;

    private static URL = "/webserver/logging/";
    private _webserverScope: boolean;
    private _status: Status = Status.Unknown;
    private _subscriptions: Array<Subscription> = [];
    private _logging: BehaviorSubject<Logging> = new BehaviorSubject<Logging>(null);
    private _logs: BehaviorSubject<Array<ApiFile>> = new BehaviorSubject<Array<ApiFile>>([]);

    constructor(private _http: HttpClient,
                route: ActivatedRoute,
                private _notifications: NotificationService,
                @Inject('FilesService') private _filesService: FilesService,
                @Inject('WebSitesService') private _webSitesService: WebSitesService) {

        this._webserverScope = route.snapshot.parent.url[0].path.toLocaleLowerCase() == 'webserver';

        this._subscriptions.push(this._filesService.change.subscribe(evt => {
            if (evt.type == ChangeType.Deleted) {
                this._logs.next(this._logs.getValue().filter(log => log.id != evt.target.id));
            }
        }));
    }

    public get status(): Status {
        return this._status;
    }

    public get webserverScope(): boolean {
        return this._webserverScope;
    }

    public get logging(): Observable<Logging> {
        return this._logging.asObservable();
    }

    public dispose() {
        this._subscriptions.forEach(sub => sub.unsubscribe());
    }

    public initialize(id: string) {
        this.load(id);
    }

    public update(data: any): Promise<Logging> {
        let id = this._logging.getValue().id;
        return this._http.patch(LoggingService.URL + id, JSON.stringify(data))
            .then(obj => {
                let logging = this._logging.getValue();
                for (var k in obj) logging[k] = obj[k]; // Copy
                this._logging.next(logging);
                return logging;
            });
    }

    public revert() {
        let id = this._logging.getValue().id;
        return this._http.delete(LoggingService.URL + id)
            .then(() => {
                this.load(id);
            });
    }

    public install(): Promise<any> {
        this._status = Status.Starting;
        return this._http.post(LoggingService.URL, "")
            .then(doc => {
                this._status = Status.Started;
                this._logging.next(doc);
            })
            .catch(e => {
                this.error = e;
                throw e;
            });
    }

    public uninstall(): Promise<any> {
        this._status = Status.Stopping;
        let id = this._logging.getValue().id;
        this._logging.next(null);
        return this._http.delete(LoggingService.URL + id)
            .then(() => {
                this._status = Status.Stopped;
            })
            .catch(e => {
                this.error = e;
                throw e;
            });
    }

    private load(id: string): Promise<Logging> {
        return this._http.get(LoggingService.URL + id)
            .then(settings => {
                this._status = Status.Started;
                this._logging.next(settings)
                return settings;
            })
            .catch(e => {
                this.error = e;

                if (e.type && e.type == ApiErrorType.FeatureNotInstalled) {
                    this._status = Status.Stopped;
                }
            });
    }

    //
    // Log Files
    //
    public get logs(): Observable<Array<ApiFile>> {
        return this._logs.asObservable();
    }

    public loadLogs() {
        let settings = this._logging.getValue();
        if (!settings.directory || !settings.website) {
            return;
        }

        this._webSitesService.get(settings.website.id)
            .then(site => {
                settings.website = site;

                return this._filesService.getByPhysicalPath(settings.directory + "/W3SVC" + settings.website.key)
                    .then(logDir => {
                        return this._filesService.getChildren(logDir)
                            .then(logFiles => {
                                let logs = this._logs.getValue();
                                logs.splice(0, logs.length);
                                logFiles.forEach(f => logs.push(f));
                                this._logs.next(logs);
                            })
                    });
            })
            .catch(e => {
                if (e.status && e.status == 404) {
                    this._notifications.clearWarnings();
                }
                throw e;
            });
    }

    public delete(logs: Array<ApiFile>) {
        this._filesService.delete(logs);
    }
}
