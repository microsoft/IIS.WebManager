import { Injectable, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, Subscription, Subject } from 'rxjs';
import { HttpClient } from '../../common/http-client';
import { ApiErrorType, ApiError } from '../../error/api-error';
import { Authorization, AuthRule } from './authorization';

export const ApiURL = "/webserver/authorization/";
@Injectable()
export class AuthorizationService implements OnDestroy {
    public error: ApiError;
    private _authorization: BehaviorSubject<Authorization> = new BehaviorSubject<Authorization>(null);
    private _rules: BehaviorSubject<Array<AuthRule>> = new BehaviorSubject<Array<AuthRule>>([]);
    private subscriptions: Subscription[] = [];

    constructor(
        private httpClient: HttpClient,
    ){
        this.subscriptions.push(
            this._authorization.subscribe(auth => this.loadRules(auth))
        )
    }

    ngOnDestroy(): void {
        for (let sub of this.subscriptions) {
            sub.unsubscribe();
        }
    }

    public get authorization(): BehaviorSubject<Authorization> {
        return this._authorization;
    }

    public get rules(): Observable<Array<AuthRule>> {
        return this._rules.asObservable();
    }

    public initialize(id: string): Promise<Authorization> {
        return this.loadSettings(id);
    }

    public save(settings: Authorization): Promise<Authorization> {
        return this.httpClient.patch(settings._links.self.href.replace('/api', ''), JSON.stringify(settings))
            .then((s: Authorization) => {
                Object.assign(settings, s);
                this.loadRules(s);
                return settings;
            });
    }

    public addRule(rule: AuthRule): Promise<AuthRule> {
        let settings: Authorization = this._authorization.getValue();
        rule.authorization = settings;
        return this.httpClient.post(settings._links.rules.href.replace('/api', ''), JSON.stringify(rule))
            .then((newRule: AuthRule) => {
                let rules = this._rules.getValue();
                rules.push(newRule);
                this._rules.next(rules);
                return newRule;
            });
    }

    public saveRule(rule: AuthRule): Promise<AuthRule> {
        return this.httpClient.patch(rule._links.self.href.replace('/api', ''), JSON.stringify(rule))
            .then((r: AuthRule) => {
                Object.assign(rule, r);
                return rule;
            });
    }

    public deleteRule(rule: AuthRule): void {
        this.httpClient.delete(rule._links.self.href.replace('/api', ''))
            .then(() => {
                let rules = this._rules.getValue();
                rules = rules.filter(r => r.id != rule.id);
                this._rules.next(rules);
            });
    }

    public revert(): Promise<Authorization> {
        let settings = this._authorization.getValue();

        return this.httpClient.delete(this._authorization.getValue()._links.self.href.replace("/api", ""))
            .then(auth => {
                this.loadSettings(settings.id).then(auth => this.loadRules(auth));
                return auth;
            });
    }

    private loadSettings(id: string): Promise<Authorization> {
        return this.httpClient.get(ApiURL + id)
            .then(feature => {
                this._authorization.next(feature);
                return feature;
            })
            .catch(e => {
                this.error = e;
                if (e.type && e.type == ApiErrorType.FeatureNotInstalled) {
                    return;
                }
                throw e;
            });
    }

    private loadRules(feature: Authorization): Promise<Array<AuthRule>> {
        if (!feature) {
            this._rules.next([]);
            return Promise.resolve([]);
        }
        return this.httpClient.get(feature._links.rules.href.replace('/api', ''))
            .then((rulesObj) => {
                this._rules.next(rulesObj.rules);
                return rulesObj.rules;
            });
    }
}
