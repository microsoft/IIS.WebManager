import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { DiffUtil } from '../../utils/diff';
import { ApiErrorType } from '../../error/api-error';
import { HttpClient } from '../../common/httpclient';
import { NotificationService } from '../../notification/notification.service';
import { CentralCertificateConfiguration } from './central-certificates';

@Injectable()
export class CentralCertificateService {
    private static URL = "/webserver/centralized-certificates/";

    public error: any;
    private _configuration: BehaviorSubject<CentralCertificateConfiguration> = new BehaviorSubject<CentralCertificateConfiguration>(null);
    private _enabled: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    public get configuration(): Observable<CentralCertificateConfiguration> {
        return this._configuration.asObservable();
    }

    public get enabled(): Observable<boolean> {
        return this._enabled.asObservable();
    }

    constructor(private _http: HttpClient, private _notificationService: NotificationService) {
    }

    public initialize(id: string) {
        return this._http.get(CentralCertificateService.URL + id)
            .then(obj => {
                this._enabled.next(true);
                this._configuration.next(obj);
                return obj;
            })
            .catch(e => {
                if (e.type && e.type == ApiErrorType.FeatureNotInstalled) {
                    this._enabled.next(false);
                    return;
                }

                throw e;
            });
    }

    public update(data: CentralCertificateConfiguration) {
        return this._http.patch(this._configuration.getValue()._links.self.href.replace("/api", ""), JSON.stringify(data))
            .then(obj => {
                DiffUtil.set(this._configuration.getValue(), obj);
                this._configuration.next(this._configuration.getValue());
            })
            .catch(e => {
                this.onError(e);
                throw e;
            });
    }

    public enable(data: CentralCertificateConfiguration) {
        return this._http.post(CentralCertificateService.URL, JSON.stringify(data))
            .then(obj => {
                this._enabled.next(true);
                this._configuration.next(obj);
            })
            .catch(e => {
                this.onError(e);
                throw e;
            });
    }

    public disable() {
        return this._http.delete(CentralCertificateService.URL + this._configuration.getValue().id)
            .then(() => {
                this._configuration.next(null);
                this._enabled.next(false);
            });
    }


    private onError(e) {
        if (e.status && e.status == 400 && e.name == 'identity') {
            this._notificationService.warn("Unable to connect to the central certificate store using the given credentials");
        }
        else if (e.status && e.status == 403 && e.name == 'physical_path') {
            this._notificationService.warn("Access to the specified physical path is not allowed");
        }
        else if (e.status && e.status == 404 && e.name == 'physical_path') {
            this._notificationService.warn("The specified directory could not be found");
        }
    }
}