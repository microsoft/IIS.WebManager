/// <reference path="../../node_modules/@angular/core/src/core.d.ts" />
/// <reference path="../../node_modules/@angular/http/src/http.d.ts" />

declare var $: any;

import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {Http} from '@angular/http';

import 'rxjs/add/operator/toPromise';
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

import {HttpConnection} from './httpconnection';
import {ApiConnection} from './api-connection';
import {ConnectionStore} from './connection-store';
import {NotificationService} from '../notification/notification.service';



@Injectable()
export class ConnectService {
    private static PING_TIMEOUT: number = 120 * 1000; // 2min

    private _store: ConnectionStore;
    private _client: HttpConnection;
    private _pingTimeoutId: number;
    private _pingPopup = new PWrapper();
    private _active: ApiConnection;
    private _connecting: BehaviorSubject<ApiConnection> = new BehaviorSubject<ApiConnection>(null);
    private _edit: BehaviorSubject<ApiConnection> = new BehaviorSubject<ApiConnection>(null);


    constructor(private _http: Http,
                private _router: Router,
                private _notificationSvc: NotificationService) {

        this._client = new HttpConnection(_http);
        this._store = new ConnectionStore();

        this.active.subscribe(c => {
            this._active = c;
        });
    }

    get connections(): Observable<Array<ApiConnection>> {
        return this._store.connections;
    }

    get active(): Observable<ApiConnection> {
        return this._store.active;
    }

    get connecting(): Observable<ApiConnection> {
        return this._connecting.asObservable();
    }

    get editting(): Observable<ApiConnection> {
        return this._edit.asObservable();
    }

    public connect(conn: ApiConnection, popup: boolean = true): Promise<any> {
        this.reset();
        this._connecting.next(conn);

        // If we tried this previously close the ping window, safe to call close multiple times
        this._pingPopup.close();

        // Open ping popup window which can only be opened as the result of a user click event
        if (popup) {
            this._pingPopup.open(conn.url + "/ping");

            // Raw request to url causes certificate acceptance prompt on IE.
            this._client.raw(conn, "/api").toPromise().then(_ => { }).catch(e => {
                // Ignore errors
            });
        }

        return this._client.get(conn, "/api").toPromise()
            .then(_ => {
                this.complete(conn);
                return Promise.resolve(conn);
            })
            .catch(_ => {
                this.gotoConnect(true);

                return this.ping(conn, new Date().getTime() + ConnectService.PING_TIMEOUT, popup);
            });
    }

    public reconnect() {
        if (this._active) {
            this.connect(this._active, false);
        }
    }

    public cancel() {
        this._notificationSvc.clearWarnings();
        this.reset();

        if (this._connecting.getValue()) {
            this._connecting.next(null);
        }
    }

    public save(conn: ApiConnection) {
        this._store.save(conn);
    }

    public delete(conn: ApiConnection) {
        this._store.delete(conn);
    }

    public edit(conn: ApiConnection) {
        this._edit.next(conn);
        this._router.navigate(['/connect']);
    }

    public gotoConnect(skipGet: boolean) {
        let totalConnections: number = 0;
        this._store.connections.subscribe(conns => totalConnections = conns.length).unsubscribe();        

        if (totalConnections == 0 && !skipGet) {
            // Goto Get
            this._router.navigate(['/get']);
        }
        else {
            this._router.navigate(['/connect']);            
        }
    }


    private activate(conn: ApiConnection) {
        this._store.setActive(conn);
    }

    private ping(conn: ApiConnection, time2stop: number, force: boolean): Promise<any> {
        clearTimeout(this._pingTimeoutId);

        return this._client.get(conn, "/api").toPromise()
            .then(_ => {
                this.complete(conn);
                return Promise.resolve(conn);
            })
            .catch(e => {
                if (e.status == 403) {
                    this.error(conn, _ => this._notificationSvc.invalidAccessToken());
                    return Promise.reject("Could not connect.");
                }
                else {
                    return this._client.options(conn, "/api").toPromise()
                        .then(_ => {
                            // 
                            // It could be a race in between the initial GET and this OPTIONS, so try one more time
                            // If still fails, it's likely that an Integrated Authentication rejected the request
                            this._client.get(conn, "/api").toPromise()
                                .then(_ => this.complete(conn))
                                .catch(e => {
                                    if (force) {
                                        // Force ping loop so the connecting screen opens
                                        this._notificationSvc.unauthorized();
                                        return this.pingLoop(conn, time2stop);
                                    }
                                    else {
                                        // Notify that the user is unauthorized but don't force the connecting page
                                        this.error(conn, _ => this._notificationSvc.unauthorized())
                                        return Promise.reject("Could not connect.");
                                    }
                                });
                        })
                        .catch(e => {
                            return this.pingLoop(conn, time2stop);
                        });
                }
            });
    }

    private pingLoop(conn: ApiConnection, time2stop: number): Promise<any> {
        let interval: number = 1000;   // 1s

        //
        // API not running, CORs not allowed or Cert not trusted
        let timeout = time2stop - new Date().getTime();

        return new Promise((resolve, reject) => {
            if (timeout > 0) {
                if (this._connecting.getValue()) {
                    this._pingTimeoutId = setTimeout(_ => {
                        this.ping(conn, time2stop, true)
                            .then(_ => {
                                resolve(conn);
                            })
                            .catch(e => {
                                reject(e);
                            });
                    }, interval);
                }
            }
            else {
                this.error(conn, _ => this._notificationSvc.remoteServerCantBeReached(conn));
                reject("Could not connect.");
            }
        });
    }

    private complete(conn: ApiConnection) {
        this.reset();

        try {
            this.activate(conn);
            this._connecting.next(null);
        }
        catch (e) {
            console.log(e);
        }

        window.location.href = "/";
    }

    private error(conn: ApiConnection, svc) {
        let connecting = this._connecting.getValue();
        this.reset(false);

        if (!connecting) {
            return;
        }

        try {
            this._connecting.next(null);
        }
        catch (e) {
            console.log(e);
        }

        if (svc) {
            svc();
        }
    }

    private reset(clearError: boolean = true) {
        clearTimeout(this._pingTimeoutId);
        this._pingTimeoutId = 0;

        if (clearError) {
            this._notificationSvc.clearWarnings();
        }

        this._pingPopup.close();
    }
}

class PWrapper {

    popup = null;
    isOpen = false;

    open(url) {
        if (!this.isOpen) {
            this.isOpen = true;

            // IE returns null when opening window to untrusted cert
            this.popup = window.open(url);
        }
    };

    close() {
        if (this.isOpen) {

            // Edge implementation of window.open can return null
            // Checking it for null does not throw CORS error
            if (this.popup != null) {
                this.popup.close();
            }

            this.isOpen = false;
        }
    };
}