import { Injectable, Inject } from '@angular/core';
import { Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { IDisposable } from '../../common/idisposable';
import { FilesService } from '../../files/files.service';
import { WebSitesService } from '../websites/websites.service';
import { ApiFile, ChangeType } from '../../files/file';
import { HttpClient } from '../../common/httpclient';
import { Logging } from './logging'


@Injectable()
export class LoggingService implements IDisposable {
    private _settings: Logging;
    private _subscriptions: Array<Subscription> = [];
    private _logs: BehaviorSubject<Array<ApiFile>> = new BehaviorSubject<Array<ApiFile>>([]);
    private _logsError: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(private _http: HttpClient,
              @Inject('FilesService') private _filesService: FilesService,
              @Inject('WebSitesService') private _webSitesService: WebSitesService) {

        this._subscriptions.push(this._filesService.change.subscribe(evt => {
            if (evt.type == ChangeType.Deleted) {
                this._logs.next(this._logs.getValue().filter(log => log.id != evt.target.id));
            }
        }));
    }

    public dispose() {
        for (let sub of this._subscriptions) {
            sub.unsubscribe();
        }
    }

    get(id: string): Promise<Logging> {
        if (this._settings && this._settings.id == id) {
            return Promise.resolve(this._settings);
        }

        return this._http.get("/webserver/logging/" + id)
            .then(settings => {
                this._settings = settings;
                return settings;
            });
    }

    update(id: string, data: any): Promise<Logging> {
        return this._http.patch("/webserver/logging/" + id, JSON.stringify(data))
            .then(obj => {
                for (var k in obj) this._settings[k] = obj[k]; // Copy

                return this._settings;
            });
    }

    revert(id: string) {
        return this._http.delete("/webserver/logging/" + id)
            .then(() => {
                this._settings = null;
            });
    }

    //
    // Log Files
    //
    public get logs(): Observable<Array<ApiFile>> {
        return this._logs.asObservable();
    }

    public get logsError(): Observable<any> {
        return this._logsError.asObservable();
    }

    public loadLogs() {
        if (!this._settings.directory || !this._settings.website) {
            return;
        }

        this._webSitesService.get(this._settings.website.id)
            .then(site => {
                this._settings.website = site;

                return this._filesService.getByPhysicalPath(this._settings.directory + "/W3SVC" + this._settings.website.key)
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
                this._logsError.next(e);
            });
    }

    public delete(logs: Array<ApiFile>) {
        this._filesService.delete(logs);
    }
}
