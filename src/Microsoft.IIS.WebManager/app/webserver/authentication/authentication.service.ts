import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { DiffUtil } from '../../utils/diff';
import { Status } from '../../common/status';
import { ApiError } from '../../error/api-error';
import { HttpClient } from '../../common/httpclient';
import { NotificationService } from '../../notification/notification.service';
import { AnonymousAuthentication, BasicAuthentication, DigestAuthentication, WindowsAuthentication } from './authentication';

@Injectable()
export class AuthenticationService {
    public anonymousError: ApiError;
    public basicError: ApiError;
    public digestError: ApiError;
    public windowsError: ApiError;

    private _settings: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    private _anonAuth: BehaviorSubject<AnonymousAuthentication> = new BehaviorSubject<AnonymousAuthentication>(null);
    private _basicAuth: BehaviorSubject<BasicAuthentication> = new BehaviorSubject<BasicAuthentication>(null);
    private _digestAuth: BehaviorSubject<DigestAuthentication> = new BehaviorSubject<DigestAuthentication>(null);
    private _windowsAuth: BehaviorSubject<WindowsAuthentication> = new BehaviorSubject<WindowsAuthentication>(null);
    private _basicStatus: Status = Status.Unknown;
    private _digestStatus: Status = Status.Unknown;
    private _windowsStatus: Status = Status.Unknown;
    private _webserverScope: boolean;

    constructor(private _http: HttpClient,
                private _notificationService: NotificationService,
                route: ActivatedRoute) {
        this._webserverScope = route.snapshot.parent.url[0].path.toLocaleLowerCase() == 'webserver';
    }

    public get settings(): Observable<any> {
        return this._settings.asObservable();
    }

    public get anonAuth(): Observable<AnonymousAuthentication> {
        return this._anonAuth.asObservable();
    }

    public get basicAuth(): Observable<BasicAuthentication> {
        return this._basicAuth.asObservable();
    }

    public get digestAuth(): Observable<DigestAuthentication> {
        return this._digestAuth.asObservable();
    }

    public get windowsAuth(): Observable<WindowsAuthentication> {
        return this._windowsAuth.asObservable();
    }

    public get basicStatus(): Status {
        return this._basicStatus;
    }

    public get digestStatus(): Status {
        return this._digestStatus;
    }

    public get windowsStatus(): Status {
        return this._windowsStatus;
    }

    public get webserverScope(): boolean {
        return this._webserverScope;
    }

    public initialize(id: string) {
        this.load(id);
    }

    private load(id: string): Promise<any> {
        return this._http.get("/webserver/authentication/" + id)
            .then(feature => {
                this._settings.next(feature);

                this.loadAnon();
                this.loadBasic();
                this.loadDigest();
                this.loadWindows();

                return feature;
            });
    }

    // All 4 authentication sub-modules share the same patch function, no type restriction
    public update(feature: any, data: any) {  
        return this._http.patch(feature._links.self.href.replace("/api", ""), JSON.stringify(data))
            .then(f => {
                DiffUtil.set(feature, f);
                this.getSubject(feature).next(feature);
                return feature;
            });
    }

    public revert(feature: any) {
        return this._http.delete(feature._links.self.href.replace("/api", ""))
            .then(_ => {
                return this._http.get(feature._links.self.href.replace("/api", ""))
                    .then(f => {
                        DiffUtil.set(feature, f);
                        this.getSubject(feature).next(feature);
                        return feature
                    });
            });
    }

    public installBasic(val: boolean) {
        const basic = "basic";
        if (val) {
            return this.installAuth(basic);
        }
        else {
            this.uninstallAuth(basic);
        }
    }

    public installDigest(val: boolean) {
        const digest = "digest";
        if (val) {
            return this.installAuth(digest);
        }
        else {
            this.uninstallAuth(digest);
        }
    }

    public installWindows(val: boolean) {
        const windows = "windows";
        if (val) {
            return this.installAuth(windows);
        }
        else {
            this.uninstallAuth(windows);
        }
    }

    private loadAnon(): Promise<AnonymousAuthentication> {
        return this._http.get(this._settings.getValue()._links.anonymous.href.replace("/api", ""))
            .then(anonymous => {
                this._anonAuth.next(anonymous);
                return anonymous;
            })
            .catch(e => {
                this.anonymousError = e;
                throw e;
            })
    }

    private loadBasic(): Promise<BasicAuthentication> {
        return this._http.get(this._settings.getValue()._links.basic.href.replace("/api", ""))
            .then(basic => {
                this._basicStatus = Status.Started;
                this._basicAuth.next(basic);
                return basic;
            })
            .catch(e => {
                this.basicError = e;

                if (e.type && e.type == 'FeatureNotInstalled') {
                    this._basicStatus = Status.Stopped;
                }

                throw e;
            })
    }

    private loadDigest(): Promise<DigestAuthentication> {
        return this._http.get(this._settings.getValue()._links.digest.href.replace("/api", ""))
            .then(digest => {
                this._digestStatus = Status.Started;
                this._digestAuth.next(digest);
                return digest;
            })
            .catch(e => {
                this.digestError = e;

                if (e.type && e.type == 'FeatureNotInstalled') {
                    this._digestStatus = Status.Stopped;
                }

                throw e;
            })
    }

    private loadWindows(): Promise<WindowsAuthentication> {
        return this._http.get(this._settings.getValue()._links.windows.href.replace("/api", ""))
            .then(windows => {
                this._windowsStatus = Status.Started;
                this._windowsAuth.next(windows);
                return windows;
            })
            .catch(e => {
                this.windowsError = e;

                if (e.type && e.type == 'FeatureNotInstalled') {
                    this._windowsStatus = Status.Stopped;
                }

                throw e;
            })
    }

    private installAuth(type: string): Promise<any> {
        this.setStatus(type, Status.Starting);
        return this._http.post("/webserver/authentication/" + type + "-authentication/", "", null, false)
            .then(req => {
                this.setStatus(type, Status.Started);

                if (type == 'windows') {
                    this.loadWindows();
                }
                else if (type == 'digest') {
                    this.loadDigest();
                }
                else if (type == 'basic') {
                    this.loadBasic();
                }
            })
            .catch(e => {
                this["_" + type + "Error"] = e;

                this.setStatus(type, Status.Stopped);
                this._notificationService.warn("Unable to turn on " + type + " authentication.");
                
                throw e;
            });
    }

    private uninstallAuth(type: string): Promise<any> {
        this.setStatus(type, Status.Stopping);
        let id = this["_" + type + "Auth"].getValue().id;
        this["_" + type + "Auth"].next(null);
        return this._http.delete("/webserver/authentication/" + type + "-authentication/" + id)
            .then(() => {
                this.setStatus(type, Status.Stopped);

                // Confirm uninstall
                this._http.get("/webserver/authentication/" + type + "-authentication/" + id)
                    .then(auth => {
                        this["_" + type + "Auth"].next(auth);
                        this._notificationService.warn("Turning off " + type + " authentication failed.");
                        this.setStatus(type, Status.Started);
                    });
            })
            .catch(e => {
                this["_" + type + "Error"] = e;
                throw e;
            });
    }

    private setStatus(type: string, val: Status) {
        this["_" + type + "Status"] = val;
    }

    private getSubject(feature: any): BehaviorSubject<any> {
        if (this._anonAuth.getValue() === feature) {
            return this._anonAuth;
        }
        else if (this._basicAuth.getValue() === feature) {
            return this._basicAuth;
        }
        else if (this._digestAuth.getValue() === feature) {
            return this._digestAuth;
        }
        else if (this._windowsAuth.getValue() === feature) {
            return this._windowsAuth;
        }

        return null;
    }
}
