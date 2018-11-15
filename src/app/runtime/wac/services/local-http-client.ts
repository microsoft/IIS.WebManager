import { HttpFacade } from 'common/http-facade'
import { Observable } from 'rxjs/Observable'
import { Request, Response, RequestMethod } from '@angular/http'
import { PowershellService } from './powershell-service'
import { Injectable } from '@angular/core';

@Injectable()
export class LocalHttpClient implements HttpFacade {
    private _cache: Map<string, any> = new Map<string, any>()
    constructor(private powershell: PowershellService) {}

    public request(req: Request): Observable<Response> {
        var id = JSON.stringify(req)
        let cached = this._cache[id]
        if (cached) {
            if (cached instanceof Response) {
                return Observable.of(cached)
            }
            return cached
        }
        return this._cache[id] = this.powershell.invokeHttp(req).map(v => {
            return this._cache[id] = v
        })
    }

    public options(url: string): Observable<Response> {
        return this.powershell.invokeHttp(new Request({method: RequestMethod.Options, url: url}))
    }
}
