import { Injectable } from '@angular/core';
import { Observable, interval, ReplaySubject, Subject } from "rxjs";
import { Status } from '../common/status';
import { HttpClient } from '../common/http-client';
import { ApiError, ApiErrorType } from '../error/api-error';
import { WebServer } from './webserver';

@Injectable()
export class WebServerService {
    public error: ApiError;

    private _server: WebServer;
    private _statusChanged: Subject<Status> = new ReplaySubject<Status>(1);
    private _installStatus: Status = Status.Unknown;

    constructor(private _http: HttpClient) {
    }

    get status(): Observable<Status> {
        return this._statusChanged.asObservable();
    }

    public get installStatus(): Status {
        return this._installStatus;
    }

    get server(): Promise<WebServer> {
        if (this._server) {
            return Promise.resolve(this._server);
        }

        return this.get();
    }

    start(): Promise<WebServer> {
        return this.updateStatus(Status.Starting, Status.Started).then(ws => {
            this.triggerStatusUpdate();
            if (ws.status == Status.Starting) {
                //
                // Ping
                let ob = interval(1000).subscribe(i => {
                    this.get().then(s => {
                        if (s.status != Status.Starting || i >= 90) {
                            ob.unsubscribe();
                        }
                        return ws;
                    });
                });
            }
            else {
                return ws;
            }
        });
    }

    stop(): Promise<WebServer> {
        return this.updateStatus(Status.Stopping, Status.Stopped).then(ws => {
            this.triggerStatusUpdate();
            if (ws.status == Status.Stopping) {
                return new Promise<WebServer>((resolve, _) => {
                    //
                    // Ping
                    let ob = interval(1000).subscribe(i => {
                        this.get().then(s => {
                            if (s.status != Status.Stopping || i >= 90) {
                                ob.unsubscribe();
                                resolve(ws);
                            }
                        });
                    });
                });
            }
            else {
                return ws;
            }
        });
    }

    private get(): Promise<WebServer> {
        return this._http.get("/webserver").then(ws => {
            this._server = new WebServer();
            this._server.id = ws.id;
            this._server._links = ws._links;

            //
            // Query Info
            if (!this._server._links || !this._server._links.info) {
                return this._server;
            }

            return this._http.get(this._server._links.info.href.replace("/api", "")).then(info => {
                this._server.name = info.name;
                this._server.status = info.status;
                this._server.version = info.version;
                this._server.supports_sni = info.supports_sni;
                this.triggerStatusUpdate();
                return this._server;
            });
        })
        .catch(e => {
            this.error = e;
            if (e.type && e.type == ApiErrorType.FeatureNotInstalled) {
                this._installStatus = Status.Stopped;
            }
            throw e
        })
    }

    private updateStatus(intermediate: Status, final: Status): Promise<WebServer> {
        if (!this._server._links || !this._server._links.service_controller) {
            return Promise.resolve(this._server);
        }
        this._server.status = intermediate;
        return this._http.patch(this._server._links.service_controller.href.replace("/api", ""), JSON.stringify({ status: final }))
            .then(sc => {
                this._server.status = sc.status; // Update the status
                return this._server;
            });
    }

    private triggerStatusUpdate() {
        this._statusChanged.next(this._server.status);
    }
}
