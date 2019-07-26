import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { DiffUtil } from '../../utils/diff';
import { Status } from '../../common/status';
import { HttpClient } from '../../common/http-client';
import { NotificationService } from '../../notification/notification.service';
import { AnonymousAuthentication, BasicAuthentication, DigestAuthentication, WindowsAuthentication } from './authentication';
import { IsWebServerScope } from 'runtime/runtime';
import { ActivatedRoute } from '@angular/router';

@Injectable()
export class AuthenticationService {
    private _settings: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    private _anonAuth: BehaviorSubject<AnonymousAuthentication> = new BehaviorSubject<AnonymousAuthentication>(null);
    private _basicAuth: BehaviorSubject<BasicAuthentication> = new BehaviorSubject<BasicAuthentication>(null);
    private _digestAuth: BehaviorSubject<DigestAuthentication> = new BehaviorSubject<DigestAuthentication>(null);
    private _windowsAuth: BehaviorSubject<WindowsAuthentication> = new BehaviorSubject<WindowsAuthentication>(null);
    private _basicStatus: Status = Status.Unknown;
    private _digestStatus: Status = Status.Unknown;
    private _windowsStatus: Status = Status.Unknown;
    private _webserverScope: boolean;

    constructor(
        private _http: HttpClient,
        private _notificationService: NotificationService,
        private _route: ActivatedRoute,
    ){
        this._webserverScope = IsWebServerScope(this._route);
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

    private async loadSafe<T>(linkName: string, subject: Subject<T>, featureStatus: string = null): Promise<T> {
        try {
            const result: T = await this._http.get(this._settings.getValue()._links[linkName].href.replace("/api", ""));
            subject.next(result);
            return result;
        } catch (e) {
            subject.error(e);
            if (featureStatus && e.type && e.type == 'FeatureNotInstalled') {
                this[featureStatus] = Status.Stopped;
            }
            throw e;
        }
    }

    private loadAnon(): Promise<AnonymousAuthentication> {
        return this.loadSafe<AnonymousAuthentication>("anonymous", this._anonAuth);
    }

    private loadBasic(): Promise<BasicAuthentication> {
        return this.loadSafe<BasicAuthentication>("basic", this._basicAuth, "_basicStatus");
    }

    private loadDigest(): Promise<DigestAuthentication> {
        return this.loadSafe<DigestAuthentication>("digest", this._digestAuth, "_digestStatus");
    }

    private loadWindows(): Promise<WindowsAuthentication> {
        return this.loadSafe<WindowsAuthentication>("windows", this._windowsAuth, "_windowsStatus");
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
