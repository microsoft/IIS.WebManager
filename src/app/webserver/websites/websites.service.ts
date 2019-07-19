import { Injectable, OnDestroy, Inject, Optional } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, } from "rxjs";
import { DiffUtil } from 'utils/diff';
import { HttpClient } from 'common/http-client';
import { Status } from 'common/status';
import { WebSite, Binding } from './site';
import { WebServerService } from '../webserver.service';
import { AppPoolsService } from '../app-pools/app-pools.service';
import { ApplicationPool } from '../app-pools/app-pool';
import { ApiError, ApiErrorType } from 'error/api-error';
import { NotificationService } from 'notification/notification.service';

@Injectable()
export class WebSitesService implements OnDestroy {
    public error: ApiError;
    private static _appPoolFields: string = "application_pool.name,application_pool.auto_start,application_pool.status,application_pool.identity,application_pool.pipeline_mode,application_pool.managed_runtime_version";
    private _all: boolean;
    private _loadedAppPools: Set<string> = new Set<string>();
    private _data: Map<string, WebSite> = new Map<string, WebSite>();
    private _webSites: BehaviorSubject<Map<string, WebSite>> = new BehaviorSubject<Map<string, WebSite>>(this._data);
    private _appPools: Map<string, ApplicationPool> = new Map<string, ApplicationPool>();
    private _installStatus: Status = Status.Unknown;
    private _subscriptions: Array<Subscription> = [];

    constructor(private _http: HttpClient,
                private _notificationService: NotificationService,
                @Optional() @Inject("WebServerService") webServerService: WebServerService,
                @Optional() @Inject("AppPoolsService") private _appPoolService: AppPoolsService) {
        //
        // Subscribe for WebServer Events
        if (webServerService) {
            this._subscriptions.push(webServerService.status.subscribe(status => {
                if (status == Status.Started || status == Status.Stopped) {
                    this._data.forEach(s => {
                        s.status = status != Status.Stopped ? (<any>s)._status : Status.Stopped;
                    });
                }
            }));
        }

        //
        // Subscribe for AppPools events
        if (this._appPoolService) {
            this._subscriptions.push(this._appPoolService.appPools.subscribe(pools => {
                if (pools.size == 0) {
                    return;
                }

                this._appPools = pools;
                this._data.forEach(s => {
                    if (s.application_pool) {
                        let pool = this._appPools.get(s.application_pool.id);
                        if (pool && pool !== s.application_pool) {
                            let p = s.application_pool;
                            s.application_pool = pool;
                            if ((<any>s)._full) {
                                DiffUtil.merge(s.application_pool, p);
                            }
                        }
                    }
                });
            }));
        }
    }

    get webSites(): Observable<Map<string, WebSite>> {
        return this._webSites.asObservable();
    }

    public get installStatus(): Status {
        return this._installStatus;
    }

    getAll(): Promise<Map<string, WebSite>> {
        if (this._all) {
            return Promise.resolve(this._data);
        }

        return this._http.get("/webserver/websites?fields=name,status,physical_path,bindings,application_pool")
            .then(res => {
                (<Array<WebSite>>res.websites).forEach(s => this.add(this.fromJson(s)));

                this._all = true;

                this._webSites.next(this._data);
                return this._data;
            })
            .catch((e: ApiError) => {
                this.handleError(e, null);
                throw e;
            });
    }

    getByAppPool(appPool: ApplicationPool): Promise<Map<string, WebSite>> {
        //
        // Try the cache
        if (this._all || this._loadedAppPools.has(appPool.id)) {
            let result = new Map<string, WebSite>();

            this._data.forEach(s => {
                if (s.application_pool && s.application_pool.id == appPool.id) {
                    result.set(s.id, s);
                }
            });

            return Promise.resolve(result);
        }


        return this._http.get("/webserver/websites?fields=name,status,physical_path,bindings,application_pool" + "&application_pool.id=" + appPool.id)
            .then(res => {
                (<Array<WebSite>>res.websites).forEach(s => this.add(this.fromJson(s)));
                this._loadedAppPools.add(appPool.id);

                this._webSites.next(this._data);
                return this.getByAppPool(appPool);
            })
            .catch((e: ApiError) => {
                this.handleError(e, null);
                throw e;
            });
    }

    get(id: string): Promise<WebSite> {
        //
        // Try the cache
        let website: WebSite = this._data.get(id);
        if (website && (<any>website)._full) {
            return Promise.resolve(website);
        }

        return this._http.get("/webserver/websites/" + id + "?fields=*," + WebSitesService._appPoolFields)
            .then(s => {
                (<any>s)._full = true;

                if (this.add(this.fromJson(s))) {
                    this._webSites.next(this._data);
                }

                return this._data.get(s.id);
            })
            .catch((e: ApiError) => {
                this.handleError(e, null);
                throw e;
            });
    }

    update(site: WebSite, data: any): Promise<WebSite> {
        return this._http.patch("/webserver/websites/" + site.id + "?fields=*," + WebSitesService._appPoolFields, JSON.stringify(data))
            .then(s => {
                if (this.add(this.fromJson(s))) {
                    this._webSites.next(this._data);
                }

                return this._data.get(s.id);
            })
            .catch(e => {
                this.handleError(e, site);
                throw e;
            });
    }

    start(site: WebSite) {
        site.status = Status.Starting;

        return this._http.patch("/webserver/websites/" + site.id, JSON.stringify({ status: "started" }))
            .then(s => {
                site.status = s.status;
            });
    }

    stop(site: WebSite) {
        site.status = Status.Stopping;

        return this._http.patch("/webserver/websites/" + site.id, JSON.stringify({ status: "stopped" }))
            .then(s => {
                site.status = s.status;
            });
    }

    delete(webSite: WebSite): Promise<any> {
        return this._http.delete("/webserver/websites/" + webSite.id)
            .then(_ => {
                this._data.delete(webSite.id);
                webSite.id = undefined; // Invalidate
                this._webSites.next(this._data);
            });
    }

    create(site: WebSite): Promise<WebSite> {

        let creationData = JSON.parse(JSON.stringify(site));

        if (creationData.application_pool) {
            creationData.application_pool = { id: site.application_pool.id };
        }

        return this._http.post("/webserver/websites?fields=*," + WebSitesService._appPoolFields, JSON.stringify(creationData))
            .then(s => {
                this.add(this.fromJson(s));
                site.id = s.id;

                this._webSites.next(this._data);

                return this._data.get(s.id);
            })
            .catch((e: ApiError) => {
                this.handleError(e, site);
                throw e;
            });
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(sub => {
            sub.unsubscribe();
        })
    }

    public getDefaultUrl(site: WebSite): string {
        if (site.bindings && site.bindings.length > 0) {
            return this.getUrl(site.bindings[0]);
        }
        return null;
    }

    public getUrl(binding: Binding, path: string = ""): string {
        // Schema
        var url = binding.is_https ? "https://" : "http://";

        // Host
        if (binding.hostname && binding.hostname.length > 0) {
            url += binding.hostname;
        }
        // IP Address
        else {
            if (binding.ip_address && binding.ip_address != "*") {
                url += binding.ip_address;
            }
            else {
                url += this._http.endpoint().hostname();
            }
        }

        // Port
        if (binding.port && binding.port != 80 && binding.port != 443) {
            url += ":" + binding.port;
        }

        // Path
        if (path && path.length > 0) {
            if (path.charAt(0) != '/') {
                url += "/";
            }

            url += path;
        }

        return url;
    }

    private fromJson(s: WebSite): WebSite {
        (<any>s)._status = s.status;

        // Link to AppPool
        if (s.application_pool) {
            let pool = this._appPools.get(s.application_pool.id);
            if (pool) {
                s.application_pool = pool;
            }
        }

        this.fillBindings(s);

        return s;
    }

    private add(s: WebSite): boolean {
        let site = this._data.get(s.id);

        if (!site) {
            // Add new
            this._data.set(s.id, s);
            return true;
        }
        else {
            // Update existing
            // Keep all _links
            let links = site._links;

            if (s.application_pool && site.application_pool) {
                DiffUtil.merge(s.application_pool, site.application_pool);
            }

            for (var p in s) {
                site[p] = s[p];
            }

            for (var p in s._links) {
                links[p] = s._links[p];
            }

            site._links = links;
        }

        return false;
    }

    private fillBindings(s: WebSite) {
        if (s.bindings != null) {
            for (let b of s.bindings) {

                // Protocol
                if (!b.protocol) {
                    b.binding_information = null;
                    if (b.is_https) {
                        b.protocol = "https";
                    }
                    else {
                        b.protocol = "http";
                    }
                }

                // is_https
                b.is_https = b.protocol === "https";

                // Binding information
                if (b.protocol.indexOf("http") === 0) {
                    b.binding_information = null;
                }
            }
        }
    }

    private handleError(e: ApiError, site: WebSite) {
        this.error = e;
        if (e.type && e.type == ApiErrorType.FeatureNotInstalled) {
            this._installStatus = Status.Stopped;
        }
        // TODO: unify 403 handling
        if (e.title && e.title.toLowerCase() == 'forbidden' && e.name == 'physical_path') {
            this._notificationService.warn(`IIS has no access to ${site.physical_path}. if the path exists, click "Create New Mapping" button to map the path to IIS file system.`);
        }
    }
}
