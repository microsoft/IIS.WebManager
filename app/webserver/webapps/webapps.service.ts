
import {Injectable, Inject, Optional} from '@angular/core';
import {Response} from '@angular/http';

// 
// Don't import rxjs/Rx. Loading is too slow!
// Import only needed operators
import {IntervalObservable} from 'rxjs/observable/IntervalObservable';
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Subscription} from "rxjs/subscription";

import {HttpClient} from '../../common/httpclient';
import {WebSite} from '../websites/site'
import {WebSitesService} from '../websites/websites.service';
import {AppPoolsService} from '../app-pools/app-pools.service';
import {ApplicationPool} from '../app-pools/app-pool';

import {WebApp} from './webapp'

import {ApiError} from '../../error/api-error';
import {NotificationService} from '../../notification/notification.service';


@Injectable()
export class WebAppsService {
    private static _webSiteFields = "website.name,website.status,website.bindings";
    private static _appPoolFields: string = "application_pool.name,application_pool.status,application_pool.identity,application_pool.pipeline_mode,application_pool.managed_runtime_version";
    private static _listUrl: string = "/webserver/webapps?fields=*";

    private _data: Map<string, WebApp> = new Map<string, WebApp>();
    private _webApps: BehaviorSubject<Map<string, WebApp>> = new BehaviorSubject<Map<string, WebApp>>(this._data);

    private _appPools: Map<string, ApplicationPool> = new Map<string, ApplicationPool>();
    private _webSites: Map<string, WebSite> = new Map<string, WebSite>();

    private _loadedAppPools: Set<string> = new Set<string>();
    private _loadedWebSites: Set<string> = new Set<string>();

    private _subscriptions: Array<Subscription> = [];


    constructor(private _http: HttpClient,
                private _notificationService: NotificationService,
                @Optional() @Inject("AppPoolsService") private _appPoolService: AppPoolsService,
                @Optional() @Inject("WebSitesService") private _webSitesService: WebSitesService) {

        //
        // Subscribe for AppPools events
        if (this._appPoolService) {
            this._subscriptions.push(this._appPoolService.appPools.subscribe(pools => {
                if (pools.size == 0) {
                    return;
                }

                this._appPools = pools;
                this._data.forEach(app => {
                    if (app.application_pool) {
                        let pool = this._appPools.get(app.application_pool.id);
                        if (pool || !app.application_pool.id) {
                            app.application_pool = pool;
                        }
                    }
                });
            }));
        }

        //
        // Subscribe for WebSites events
        if (this._webSitesService) {
            this._subscriptions.push(this._webSitesService.webSites.subscribe(sites => {
                if (sites.size == 0) {
                    return;
                }

                this._webSites = sites;

                let appsCount = this._data.size;

                this._data.forEach(app => {
                    if (!app.website.id) {
                        // The WebSite has been deleted. Remove the app
                        this._data.delete(app.id);
                        app.id = undefined;
                    }
                    else {
                        let site = this._webSites.get(app.website.id);
                        if (site) {
                            app.website = site;
                        }
                    }
                });

                if (appsCount != this._data.size) {
                    this._webApps.next(this._data);
                }
            }));
        }
    }

    get webApps(): Observable<Map<string, WebApp>> {
        return this._webApps.asObservable();
    }

    getBySite(website: WebSite): Promise<Map<string, WebApp>> {
        //
        // Try the cache
        if (this._loadedWebSites.has(website.id)) {
            let result = new Map<string, WebApp>();

            this._data.forEach(app => {
                if (app.website.id == website.id) {
                    result.set(app.id, app);
                }
            });

            return Promise.resolve(result);
        }

        return this._http.get("/webserver/webapps?fields=path,physical_path,application_pool," + WebAppsService._webSiteFields + "&website.id=" + website.id)
            .then(res => {
                (<Array<WebApp>>res.webapps).forEach(app => this._data.set(app.id, this.fromJson(app)));
                this._loadedWebSites.add(website.id);

                this._webApps.next(this._data);
                return this.getBySite(website);
            });
    }

    getByAppPool(appPool: ApplicationPool): Promise<Map<string, WebApp>> {
        //
        // Try the cache
        if (this._loadedAppPools.has(appPool.id)) {
            let result = new Map<string, WebApp>();

            this._data.forEach(app => {
                if (app.application_pool && app.application_pool.id == appPool.id) {
                    result.set(app.id, app);
                }
            });

            return Promise.resolve(result);
        }

        return this._http.get("/webserver/webapps?fields=path,physical_path,application_pool," + WebAppsService._webSiteFields + "&application_pool.id=" + appPool.id)
            .then(res => {
                (<Array<WebApp>>res.webapps).forEach(app => this._data.set(app.id, this.fromJson(app)));
                this._loadedAppPools.add(appPool.id);

                this._webApps.next(this._data);
                return this.getByAppPool(appPool);
            });
    }

    get(id: string): Promise<WebApp> {
        //
        // Try the cache
        let app: WebApp = this._data.get(id);
        if (app) {
            return Promise.resolve(app);
        }

        return this._http.get("/webserver/webapps/" + id + "?fields=*," + WebAppsService._webSiteFields + "," + WebAppsService._appPoolFields)
            .then(app => {
                this._data.set(app.id, this.fromJson(app));
                this._webApps.next(this._data);
                return app;
            })
    }

    delete(app: WebApp): Promise<any> {
        return this._http.delete("/webserver/webapps/" + app.id)
            .then(_ => {
               this._data.delete(app.id);
               app.id = undefined; // Invalidate

               this._webApps.next(this._data);
            });
    }

    create(data: WebApp): Promise<WebApp> {
        if (!data.website) {
            throw new Error("Invalid WebSite");
        }

        data.website = <WebSite>{ id: data.website.id };

        if (data.application_pool) {
            data.application_pool = { id: data.application_pool.id };
        }

        return this._http.post("/webserver/webapps?fields=*," + WebAppsService._webSiteFields + "," + WebAppsService._appPoolFields, JSON.stringify(data))
            .then(a => {
                this._data.set(a.id, this.fromJson(a));
                data.id = a.id;

                this._webApps.next(this._data);

                return this._data.get(a.id);
            })
            .catch(e => {
                this.handleError(e, data);
                throw e;
            });
    }

    update(app: WebApp, data: any): Promise<WebApp> {
        return this._http.patch("/webserver/webapps/" + app.id + "?fields=*," + WebAppsService._webSiteFields + "," + WebAppsService._appPoolFields, JSON.stringify(data))
            .then(a => {
                //
                // Path change will change the id
                if (app.id != a.id) {
                    this._data.delete(app.id);
                    this._data.set(a.id, app);
                }

                // Update all properties
                for (var k in a) app[k] = a[k];

                return app;
            })
            .catch(e => {
                this.handleError(e, data);
                throw e;
            });
    }

    public destroy() {
        this._subscriptions.forEach(sub => {
            sub.unsubscribe();
        });
    }

    private fromJson(app: WebApp): WebApp {
        // Reference AppPool
        if (app.application_pool) {
            let pool = this._appPools.get(app.application_pool.id);
            if (pool) {
                app.application_pool = pool;
            }
        }

        // Reference WebSite
        let site = this._webSites.get(app.website.id);
        if (site) {
            app.website = site;
        }

        return app;
    }

    private handleError(e: ApiError, app: WebApp) {
        if (e.title && e.title.toLowerCase() == 'forbidden' && e.name == 'physical_path') {
            this._notificationService.warn("Access denied\n\n" + app.physical_path);
        }
    }
}
