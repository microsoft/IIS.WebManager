import { Injectable, Inject, Optional } from '@angular/core';
import { Response } from '@angular/http';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { IDisposable } from '../../common/idisposable';
import { ApiFile, ApiFileType, ChangeType } from '../../files/file';
import { FilesService } from '../../files/files.service';

import { HttpClient } from '../../common/httpclient';
import { RequestTracing, Provider, RequestTracingRule, TraceLog } from './request-tracing';



@Injectable()
export class RequestTracingService implements IDisposable {
    private _requestTracing: RequestTracing;
    private _providers: Array<Provider>;
    private _rules: Array<RequestTracingRule>;
    private _subscriptions: Array<Subscription> = [];
    private _traces: BehaviorSubject<Array<TraceLog>> = new BehaviorSubject<Array<TraceLog>>([]);
    private _traceError: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    public error: any;

    constructor(private _http: HttpClient,
                @Optional() @Inject('FilesService') private _filesService: FilesService) {

        this._subscriptions.push(this._filesService.change.subscribe(evt => {
            if (evt.type == ChangeType.Deleted) {
                this._traces.next(this._traces.getValue().filter(t => t.file_info.id != evt.target.id));
            }
        }));
    }

    public dispose(): void {
        for (let sub of this._subscriptions) {
            sub.unsubscribe();
        }
    }

    get(id: string): Promise<RequestTracing> {
        if (this._requestTracing) {
            return Promise.resolve(this._requestTracing);
        }

        return this._http.get("/webserver/http-request-tracing/" + id)
            .then(obj => {
                this._requestTracing = obj;
                return this._requestTracing
            })
            .catch(e => {
                this.error = e;
                throw e;
            });
    }

    update(data: RequestTracing): Promise<RequestTracing> {
        return this._http.patch(this._requestTracing._links.self.href.replace("/api", ""), JSON.stringify(data))
            .then(obj => {
                for (var k in obj) this._requestTracing[k] = obj[k]; // Copy

                return this._requestTracing;
            });
    }

    //
    // Providers
    // 
    get providers(): Promise<Array<Provider>> {
        if (this._providers) {
            return Promise.resolve(this._providers);
        }

        return this._http.get(this._requestTracing._links.providers.href.replace("/api", "") + "&fields=*")
            .then(obj => {
                this._providers = obj.providers.map(p => this.providerFromJson(p));
                return this._providers;
            });
    }

    updateProvider(provider: Provider, data: any) {
        return this._http.patch(provider._links.self.href.replace("/api", ""), JSON.stringify(data))
            .then(p => {
                p = this.providerFromJson(p);
                for (var k in p) provider[k] = p[k]; // Copy

                return provider;
            });
    }

    createProvider(provider: Provider): Promise<Provider> {
        provider.request_tracing = <RequestTracing>{ id: this._requestTracing.id };

        return this._http.post(this._requestTracing._links.providers.href.replace("/api", ""), JSON.stringify(provider))
            .then(p => {
                p = this.providerFromJson(p);
                for (var k in p) provider[k] = p[k]; // Copy

                this._providers.push(provider);
                return provider;
            });
    }

    deleteProvider(provider: Provider): Promise<any> {
        return this._http.delete(provider._links.self.href.replace("/api", ""))
            .then(_ => {
                let i = this._providers.indexOf(provider);
                if (i >= 0) {
                    this._providers.splice(i, 1);
                }

                provider.id = undefined;
            });
    }


    //
    // Rules
    //
    get rules(): Promise<Array<RequestTracingRule>> {
        if (this._rules) {
            return Promise.resolve(this._rules);
        }

        return this._http.get(this._requestTracing._links.rules.href.replace("/api", "") + "&fields=*")
            .then(arr => {
                this._rules = arr.rules.map(r => this.ruleFromJson(r));
                return this._rules;
            });
    }

    updateRule(rule: RequestTracingRule, data: any) {
        return this._http.patch(rule._links.self.href.replace("/api", ""), JSON.stringify(data))
            .then(obj => {
                obj = this.ruleFromJson(obj);
                for (var k in obj) rule[k] = obj[k]; // Copy

                return rule;
            });
    }

    createRule(data: RequestTracingRule) {
        data.request_tracing = <RequestTracing>{ id: this._requestTracing.id };

        return this._http.post(this._requestTracing._links.rules.href.replace("/api", ""), JSON.stringify(data))
            .then(obj => {
                this._rules.push(this.ruleFromJson(obj));
                return obj;
            });
    }

    deleteRule(rule: RequestTracingRule): Promise<any> {
        return this._http.delete(rule._links.self.href.replace("/api", ""))
            .then(_ => {
                let i = this._rules.indexOf(rule);
                if (i >= 0) {
                    this._rules.splice(i, 1);
                }

                rule.id = undefined;
            });
    }

    //
    // Traces
    //
    public get traces(): Observable<Array<TraceLog>> {
        return this._traces.asObservable();
    }

    public get traceError(): Observable<any> {
        return this._traceError.asObservable();
    }

    public loadTraces() {
        this._http.get(this._requestTracing._links.traces.href.replace('/api', ''), null, false)
            .then(res => {
                let traces = this._traces.getValue();
                traces.splice(0, traces.length);
                res.traces.map(t => TraceLog.FromObj(t)).forEach(e => traces.push(e));
                this._traces.next(traces);
            })
            .catch(e => {
                this._traceError.next(e);
            });
    }

    public delete(logs: Array<TraceLog>) {
        logs = logs.filter(l => l.file_info && l.file_info.name.endsWith('.xml'));
        this._filesService.delete(logs.map(log => log.file_info));
    }

    private providerFromJson(obj: Provider): Provider {
        obj.request_tracing = this._requestTracing;

        // Remove '{}' from the guid
        if (obj.guid && obj.guid[0] == '{') {
            obj.guid = obj.guid.substr(1, obj.guid.length - 2);
        }

        return obj;
    }

    private ruleFromJson(obj: RequestTracingRule): RequestTracingRule {
        obj.request_tracing = this._requestTracing;

        if (this._providers) {
            for (var t of obj.traces) {
                for (var p of this._providers) {
                    if (p.id == t.provider.id) {
                        t.provider = p;
                        break;
                    }
                }
            }
        }
        else {
            this.providers.then(_ => {
                this.ruleFromJson(obj);
            });
        }

        return obj;
    }
}