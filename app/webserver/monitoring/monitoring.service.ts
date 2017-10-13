import { Injectable, EventEmitter } from '@angular/core';
import { Response } from '@angular/http';

import { Observable } from "rxjs/Observable";
import { IntervalObservable } from 'rxjs/observable/IntervalObservable';
import { BehaviorSubject } from "rxjs/BehaviorSubject";

import { HttpClient } from '../../common/httpclient';
import { ApiError, ApiErrorType } from '../../error/api-error';

import { ServerSnapshot } from './server-snapshot';

@Injectable()
export class MonitoringService {
    public error: ApiError;

    constructor(private _http: HttpClient) {
    }

    public getSnapshot(): Promise<ServerSnapshot> {
        return this._http.get("/webserver/monitoring");
    }
}
