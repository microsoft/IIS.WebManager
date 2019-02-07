import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Status } from '../../common/status';
import { HttpClient } from '../../common/httpclient';
import { ApiError, ApiErrorType } from '../../error/api-error';
import { Authorization, AuthRule } from './authorization'
import { IsWebServerScope } from 'runtime/runtime';
import { ActivatedRoute } from '@angular/router';

@Injectable()
export class AuthorizationService {
    public error: ApiError;

    private static URL = "/webserver/authorization/";
    private _webserverScope: boolean;
    private _status: Status = Status.Unknown;
    private _authorization: BehaviorSubject<Authorization> = new BehaviorSubject<Authorization>(null);
    private _rules: BehaviorSubject<Array<AuthRule>> = new BehaviorSubject<Array<AuthRule>>([]);

    constructor(
        private _route: ActivatedRoute,
        private _http: HttpClient,
    ){
        this._webserverScope = IsWebServerScope(this._route);
    }

    public get authorization(): Observable<Authorization> {
        return this._authorization.asObservable();
    }

    public get rules(): Observable<Array<AuthRule>> {
        return this._rules.asObservable();
    }

    public get status(): Status {
        return this._status;
    }

    public get webserverScope(): boolean {
        return this._webserverScope;
    }

    public initialize(id: string): void {
        this.loadSettings(id).then(feature => {
            this.loadRules();
        });
    }

    public install(): Promise<any> {
        this._status = Status.Starting;
        return this._http.post(AuthorizationService.URL, "")
            .then(auth => {
                this._status = Status.Started;
                this._authorization.next(auth);
                this.loadRules();
            })
            .catch(e => {
                this.error = e;
                throw e;
            });
    }

    public uninstall(): Promise<any> {
        this._status = Status.Stopping;
        let id = this._authorization.getValue().id;
        this._authorization.next(null);
        return this._http.delete(AuthorizationService.URL + id)
            .then(() => {
                this._status = Status.Stopped;
            })
            .catch(e => {
                this.error = e;
                throw e;
            });
    }

    public save(settings: Authorization): Promise<Authorization> {
        return this._http.patch(settings._links.self.href.replace('/api', ''), JSON.stringify(settings))
            .then((s: Authorization) => {
                Object.assign(settings, s);
                this.loadRules();
                return settings;
            });
    }

    public addRule(rule: AuthRule): Promise<AuthRule> {
        let settings: Authorization = this._authorization.getValue();
        rule.authorization = settings;

        return this._http.post(settings._links.rules.href.replace('/api', ''), JSON.stringify(rule))
            .then((newRule: AuthRule) => {
                let rules = this._rules.getValue();
                rules.push(newRule);
                this._rules.next(rules);
                return newRule;
            });
    }

    public saveRule(rule: AuthRule): Promise<AuthRule> {
        return this._http.patch(rule._links.self.href.replace('/api', ''), JSON.stringify(rule))
            .then((r: AuthRule) => {
                Object.assign(rule, r);
                return rule;
            });
    }

    public deleteRule(rule: AuthRule): void {
        this._http.delete(rule._links.self.href.replace('/api', ''))
            .then(() => {
                let rules = this._rules.getValue();
                rules = rules.filter(r => r.id != rule.id);
                this._rules.next(rules);
            });
    }

    public revert(): Promise<any> {
        let settings = this._authorization.getValue();

        return this._http.delete(this._authorization.getValue()._links.self.href.replace("/api", ""))
            .then(_ => {
                return this.loadSettings(settings.id).then(set => this.loadRules());
            });
    }

    private loadSettings(id: string): Promise<Authorization> {
        return this._http.get(AuthorizationService.URL + id)
            .then(feature => {
                this._status = Status.Started;
                this._authorization.next(feature);
                return feature;
            })
            .catch(e => {
                this.error = e;

                if (e.type && e.type == ApiErrorType.FeatureNotInstalled) {
                    this._status = Status.Stopped;
                    return;
                }

                throw e;
            });
    }

    private loadRules(): Promise<Array<AuthRule>> {
        let feature = this._authorization.getValue();

        return this._http.get(feature._links.rules.href.replace('/api', ''))
            .then((rulesObj) => {
                this._rules.next(rulesObj.rules);
                return rulesObj.rules;
            });
    }
}
