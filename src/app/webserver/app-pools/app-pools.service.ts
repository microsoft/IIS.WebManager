import {Injectable} from '@angular/core';
import {HttpClient} from '../../common/http-client';
import {Status} from '../../common/status';
import {ApplicationPool} from './app-pool';
import {BehaviorSubject, Observable, interval} from "rxjs";

@Injectable()
export class AppPoolsService {
    private _all: boolean;
    private _data: Map<string, ApplicationPool> = new Map<string, ApplicationPool>();
    private _appPools: BehaviorSubject<Map<string, ApplicationPool>> = new BehaviorSubject<Map<string, ApplicationPool>>(this._data);

    constructor(private _http: HttpClient) {
    }

    get appPools(): Observable<Map<string, ApplicationPool>> {
        return this._appPools.asObservable();
    }

    getAll(): Promise<Map<string, ApplicationPool>> {
        if (this._all) {
            return Promise.resolve(this._data);
        }

        return this._http.get("/webserver/application-pools?fields=name,status,identity,pipeline_mode,managed_runtime_version")
            .then(res => {
                (<Array<ApplicationPool>>res.app_pools).forEach(p => this.add(p));
                
                this._all = true;
                this._appPools.next(this._data);

                return this._data;
            });
    }

    get(id: string): Promise<ApplicationPool> {
        let pool = this._data.get(id);
        if (pool && (<any>pool)._full) {
            return Promise.resolve(pool);
        }

        return this.loadAppPool(id).then(p => {
            if (this.add(p)) {
                this._appPools.next(this._data);
            }

            return this._data.get(id);
        });
    }

    update(pool: ApplicationPool, data: any): Promise<ApplicationPool> {
        //
        // Cache it if doesn't exist
        if (!this._data.has(pool.id)) {
            this._data.set(pool.id, pool);
            this._appPools.next(this._data);
        }

        return this._http.patch("/webserver/application-pools/" + pool.id, JSON.stringify(data)).then(p => {
            //
            // AppPool Name change will change the id
            if (pool.id != p.id) {
                this._data.delete(pool.id);
            }

            this.add(p);

            return pool;
        });
    }

    create(data: ApplicationPool): Promise<ApplicationPool> {
        return this._http.post("/webserver/application-pools", JSON.stringify(data)).then(p => {
            this._data.set(p.id, p);
            data.id = p.id;

            this._appPools.next(this._data);

            return this._data.get(p.id);
        });
    }

    start(pool: ApplicationPool): Promise<ApplicationPool> {
        pool.status = Status.Starting;

        return this.update(pool, { status: "started" }).then(p => {
            pool.status = p.status;
            //
            // Ping
            if (pool.status == Status.Starting) {
                let ob = interval(1000).subscribe(i => {
                    this.loadAppPool(pool.id, "status").then(p => {
                        pool.status = p.status;

                        if (pool.status != Status.Starting || i >= 10) {
                            ob.unsubscribe();
                        }
                    });
                });
            }
            return p;
        });
    }

    stop(pool: ApplicationPool): Promise<ApplicationPool> {
        pool.status = Status.Stopping;

        return this.update(pool, { status: "stopped" }).then(p => {
            pool.status = p.status;
            //
            // Ping
            if (pool.status == Status.Stopping) {
                let ob = interval(1000).subscribe(i => {
                    this.loadAppPool(pool.id, "status").then(p => {
                        pool.status = p.status;
                        if (pool.status != Status.Stopping || i >= 90) {
                            ob.unsubscribe();
                        }
                    });
                });
            }
            return p;
        });
    }

    recycle(pool: ApplicationPool) {
        if (pool.status == Status.Stopped) {
            return this.start(pool);
        } else {
            return this.stop(pool).then(_ => this.start(pool));
        }
    }

    delete(pool: ApplicationPool): Promise<any> {
        return this._http.delete("/webserver/application-pools/" + pool.id).then(_ => {
            this._data.delete(pool.id);
            pool.id = undefined; // Invalidate

            this._appPools.next(this._data);
        });
    }

    private loadAppPool(id: string, fields?: string): Promise<ApplicationPool> {
        let url = "/webserver/application-pools/" + id;
        let hasFields = (fields && fields.length > 0);

        if (hasFields) {
            url += "?fields=" + fields;
        }

        return this._http.get(url).then(p => {
            if (!hasFields) {
                (<any>p)._full = true;
            }

            return p;
        });
    }

    private add(p: ApplicationPool): boolean {
        let pool = this._data.get(p.id);

        if (!pool) {
            this._data.set(p.id, p);
            return true;
        }
        else {
            // Update all properties
            // Keep all _links
            let links = pool._links;

            for (var k in p) {
                pool[k] = p[k];
            }

            for (var k in p._links) {
                links[k] = p._links[k];
            }

            pool._links = links;
        }

        return false;
    }
}
