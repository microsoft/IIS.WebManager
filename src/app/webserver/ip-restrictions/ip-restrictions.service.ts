import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { DiffUtil } from '../../utils/diff';
import { Status } from '../../common/status';
import { HttpClient } from '../../common/http-client';
import { ApiError, ApiErrorType } from '../../error/api-error';
import { IpRestrictions, RestrictionRule } from './ip-restrictions';
import { ActivatedRoute } from '@angular/router';
import { IsWebServerScope } from 'runtime/runtime';

@Injectable()
export class IpRestrictionsService {
    public error: ApiError;

    private static URL = "/webserver/ip-restrictions/";
    private _webserverScope: boolean;
    private _status: Status = Status.Unknown;
    private _ipRestrictions: BehaviorSubject<IpRestrictions> = new BehaviorSubject<IpRestrictions>(null);
    private _rules: BehaviorSubject<Array<RestrictionRule>> = new BehaviorSubject<Array<RestrictionRule>>([]);

    constructor(
        private _route: ActivatedRoute,
        private _http: HttpClient,
    ){
        this._webserverScope = IsWebServerScope(this._route);
    }

    public get status(): Status {
        return this._status;
    }

    public get webserverScope(): boolean {
        return this._webserverScope;
    }

    public get ipRestrictions(): Observable<IpRestrictions> {
        return this._ipRestrictions.asObservable();
    }

    public get rules(): Observable<Array<RestrictionRule>> {
        return this._rules.asObservable();
    }

    public initialize(id: string) {
        this.load(id);
    }

    //
    // Feature

    public updateFeature(data: IpRestrictions) {
        let id = this._ipRestrictions.getValue().id;

        return this._http.patch(IpRestrictionsService.URL + id, JSON.stringify(data))
            .then(feature => {
                let restrictions = this._ipRestrictions.getValue();
                DiffUtil.set(restrictions, feature);

                if (!restrictions.enabled) {
                    let rules = this._rules.getValue();
                    rules.splice(0);
                    this._rules.next(rules);
                }

                this._ipRestrictions.next(restrictions);
            });
    }

    public revert() {
        let id = this._ipRestrictions.getValue().id;
        return this._http.delete(IpRestrictionsService.URL + id)
            .then(() => this.initialize(id));
    }

    public install(): Promise<any> {
        this._status = Status.Starting;
        return this._http.post(IpRestrictionsService.URL, "")
            .then(doc => {
                this._status = Status.Started;
                this._ipRestrictions.next(doc);
            })
            .catch(e => {
                this.error = e;
                throw e;
            });
    }

    public uninstall(): Promise<any> {
        this._status = Status.Stopping;
        let id = this._ipRestrictions.getValue().id;
        this._ipRestrictions.next(null);
        return this._http.delete(IpRestrictionsService.URL + id)
            .then(() => {
                this._status = Status.Stopped;
            })
            .catch(e => {
                this.error = e;
                throw e;
            });
    }

    private load(id: string): Promise<any> {
        return this._http.get(IpRestrictionsService.URL + id)
            .then(feature => {
                this._status = Status.Started;
                this._ipRestrictions.next(feature);
                return feature;
            })
            .catch(e => {
                this.error = e;

                if (e.type && e.type == ApiErrorType.FeatureNotInstalled) {
                    this._status = Status.Stopped;
                }

                throw e;
            });
    }

    //
    // Rules

    public addRule(rule: RestrictionRule) {
        rule.ip_restriction = this._ipRestrictions.getValue();

        return this._http.post(this._ipRestrictions.getValue()._links.entries.href.replace("/api", ""), JSON.stringify(rule))
            .then(rule => {
                let rules = this._rules.getValue();

                rules.unshift(rule);

                // Adding first rule enables the feature
                if (rules.length == 1) {
                    this.load(this._ipRestrictions.getValue().id);
                }

                this._rules.next(rules);
            });
    }

    public updateRule(rule: RestrictionRule, data: RestrictionRule) {
        return this._http.patch(rule._links.self.href.replace("/api", ""), JSON.stringify(data))
            .then(r => {
                DiffUtil.set(rule, r);
                return rule;
            });
    }

    public deleteRule(rule: RestrictionRule): Promise<any> {
        return this._http.delete(rule._links.self.href.replace("/api", ""))
            .then(() => {
                let rules = this._rules.getValue().filter(r => r !== rule);
                this._rules.next(rules);
            });
    }

    public loadRules() {
        return this._http.get(this._ipRestrictions.getValue()._links.entries.href.replace("/api", "") + "&fields=*")
            .then(rulesArr => {
                this._rules.next(rulesArr.entries);
            });
    }

    //
    //
}
