import {Injectable, Optional, Inject} from '@angular/core';
import {Observable, BehaviorSubject, Subscription} from "rxjs";
import {HttpClient} from '../../common/http-client';
import {ApiError} from '../../error/api-error';
import {NotificationService} from '../../notification/notification.service';
import {Vdir} from './vdir';
import {WebSitesService} from '../websites/websites.service';
import {WebSite} from '../websites/site';
import {WebAppsService} from '../webapps/webapps.service';
import {WebApp} from '../webapps/webapp';

@Injectable()
export class VdirsService {
    private static _webSiteFields = "website.name,website.status,website.bindings";

    private _data: Map<string, Vdir> = new Map<string, Vdir>();
    private _vdirs: BehaviorSubject<Map<string, Vdir>> = new BehaviorSubject<Map<string, Vdir>>(this._data);

    private _webSites: Map<string, WebSite> = new Map<string, WebSite>();
    private _webApps: Map<string, WebApp> = new Map<string, WebApp>();

    private _loadedWebSites: Set<string> = new Set<string>();
    private _loadedWebApps: Set<string> = new Set<string>();

    private _subscriptions: Array<Subscription> = [];

    constructor(private _http: HttpClient,
                private _notificationService: NotificationService,
                @Optional() @Inject("WebSitesService") private _webSitesService: WebSitesService,
                @Optional() @Inject("WebAppsService") private _webAppsService: WebAppsService) {
        //
        // Subscribe for WebSites events
        if (this._webSitesService) {
            this._webSitesService.webSites.subscribe(sites => {
                if (sites.size == 0) {
                    return;
                }

                this._webSites = sites;

                let vdirsCount = this._data.size;

                this._data.forEach(vdir => {
                    if (!vdir.website.id) {
                        this._data.delete(vdir.id);
                        vdir.id = undefined;
                    }
                    else {
                        let site = this._webSites.get(vdir.website.id);
                        if (site) {
                            vdir.website = site;
                        }
                    }
                });

                if (vdirsCount != this._data.size) {
                    this._vdirs.next(this._data);
                }
            });
        }

        // Subscrive for WebApps events
        if (this._webAppsService) {
            this._webAppsService.webApps.subscribe(apps => {
                if (apps.size == 0) {
                    return;
                }

                this._webApps = apps;

                let vdirsCount = this._data.size;

                this._data.forEach(vdir => {
                    if (!vdir.webapp.id) {
                        this._data.delete(vdir.id);
                        vdir.id = undefined;
                    }
                    else {
                        let app = this._webApps.get(vdir.webapp.id);
                        if (app) {
                            vdir.webapp = app;
                        }
                    }
                });

                if (vdirsCount != this._data.size) {
                    this._vdirs.next(this._data);
                }
            });
        }
    }

    get vdirs(): Observable<Map<string, Vdir>> {
        return this._vdirs.asObservable();
    }

    getBySite(website: WebSite): Promise<Map<string, Vdir>> {
        //
        // Try the cache
        if (this._loadedWebSites.has(website.id)) {
            let result = new Map<string, Vdir>();

            this._data.forEach(vdir => {
                if (vdir.website.id == website.id) {
                    result.set(vdir.id, vdir);
                }
            });

            return Promise.resolve(result);
        }

        return this._http.get("/webserver/virtual-directories?website.id=" + website.id + "&fields=*," + VdirsService._webSiteFields)
            .then(res => {
                (<Array<Vdir>>res.virtual_directories).forEach(vdir => this._data.set(vdir.id, this.fromJson(vdir)));
                this._loadedWebSites.add(website.id);

                this._vdirs.next(this._data);
                return this.getBySite(website);
            });
    }

    getByApp(webapp: WebApp): Promise<Map<string, Vdir>> {
        //
        // Try the cache
        if (this._loadedWebApps.has(webapp.id)) {
            let result = new Map<string, Vdir>();

            this._data.forEach(vdir => {
                if (vdir.webapp.id == webapp.id) {
                    result.set(vdir.id, vdir);
                }
            });

            return Promise.resolve(result);
        }

        return this._http.get("/webserver/virtual-directories?webapp.id=" + webapp.id + "&fields=*," + VdirsService._webSiteFields)
            .then(res => {
                (<Array<Vdir>>res.virtual_directories).forEach(vdir => this._data.set(vdir.id, this.fromJson(vdir)));
                this._loadedWebApps.add(webapp.id);

                this._vdirs.next(this._data);
                return this.getByApp(webapp);
            });
    }

    public get(id: string): Promise<Vdir> {
        //
        // Try the cache
        let vdir: Vdir = this._data.get(id);
        if (vdir) {
            return Promise.resolve(vdir);
        }

        return this._http.get("/webserver/virtual-directories/" + id + "?fields=*," + VdirsService._webSiteFields)
            .then(v => {
                this._data.set(v.id, v);
                this._vdirs.next(this._data);
                return v;
            });
    }

    public update(vdir: Vdir): Promise<Vdir> {
        if (!this._data.has(vdir.id)) {
            this._data.set(vdir.id, vdir);
            this._vdirs.next(this._data);
        }

        return this._http.patch("/webserver/virtual-directories/" + vdir.id + "?fields=*," + VdirsService._webSiteFields, JSON.stringify(vdir))
            .then(v => {
                for (var p in v) vdir[p] = v[p];
                return vdir;
            })
            .catch(e => {
                this.handleError(e, vdir);
                throw e;
            });
    }

    public create(vdir: Vdir): Promise<Vdir> | any {
        return this._http.post("/webserver/virtual-directories" + "?fields=*," + VdirsService._webSiteFields, JSON.stringify(vdir))
            .then(v => {
                this._data.set(v.id, v);
                vdir.id = v.id;

                this._vdirs.next(this._data);

                return this._data.get(v.id);
            })
            .catch(e => {
                this.handleError(e, vdir);
                throw e;
            });
    }

    public delete(vdir: Vdir): Promise<any> {
        if (!vdir.id) {
            this._vdirs.next(this._data);
            return Promise.resolve();
        }

        return this._http.delete("/webserver/virtual-directories/" + vdir.id)
            .then(_ => {
                this._data.delete(vdir.id);
                vdir.id = undefined;

                this._vdirs.next(this._data);
            });
    }

    public destroy() {
        this._subscriptions.forEach(sub => {
            sub.unsubscribe();
        });
    }

    private fromJson(vdir: Vdir): Vdir {
        // Reference WebSite
        let site = this._webSites.get(vdir.website.id);
        if (site) {
            vdir.website = site;
        }

        // Reference WebApp
        let app = this._webApps.get(vdir.webapp.id);
        if (app) {
            vdir.webapp = app;
        }

        return vdir;
    }

    private handleError(e: ApiError, vdir: Vdir) {
        // TODO: unify 403 handling
        if (e.title && e.title.toLowerCase() == 'forbidden' && e.name == 'physical_path') {
            this._notificationService.warn(`IIS has no access to ${vdir.physical_path}. if the path exists, use "New File System Mapping" button to map the path to IIS file system.`);
        }
    }
}
