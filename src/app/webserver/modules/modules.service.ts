import {Injectable} from '@angular/core';
import {Modules, LocalModule, GlobalModule} from './modules';
import {HttpClient} from '../../common/httpclient';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class ModuleService {

    constructor(private _http: HttpClient) {
    }

    get(id: string): Promise<any> {
        return this.getFeature(id).then(f => {
            return this.getModules(f).then(m => {
                return this.getGlobalModules().then(g => {
                    return {
                        feature: f,
                        modules: m,
                        globalModules: g
                    };
                });
            });
        });
    }

    addModule(feature: Modules, module: LocalModule): Promise<LocalModule> {
        return this._http.post(feature._links.entries.href.replace("/api", ""), JSON.stringify(module));
    }

    addGlobalModule(module: GlobalModule): Promise<GlobalModule> {
        return this._http.post("/webserver/global-modules", JSON.stringify(module));
    }


    // Argument can be either managed module and global module
    removeModule(module: any): Promise<any> {
        return this._http.delete(module._links.self.href.replace("/api", ""));
    }

    patchFeature(feature: Modules, data: Modules) {
        return this._http.patch(feature._links.self.href.replace("/api", ""), JSON.stringify(data))
            .then(feature => {
                return feature;
            });
    }

    revert(id: string): Promise<any> {
        return this._http.delete("/webserver/http-modules/" + id);
    }

    private getFeature(id: string): Promise<Modules> {
        return this._http.get("/webserver/http-modules/" + id)
            .then(feature => {
                return feature;
            });
    }

    private getGlobalModules(): Promise<Array<GlobalModule>> {
        return this._http.get("/webserver/global-modules?fields=*")
            .then(arr => {
                return arr.global_modules;
            });
    }

    private getModules(feature: Modules): Promise<Array<LocalModule>> {
        return this._http.get(feature._links.entries.href.replace("/api", "") + "&fields=*")
            .then(arr => {
                return arr.entries;
            });
    }
    
}
