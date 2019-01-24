import { HttpFacade } from 'common/http-facade'
import { Observable } from 'rxjs'
import { Request, Response, RequestMethod } from '@angular/http'
import { PowershellService } from './powershell-service'
import { Injectable, Inject } from '@angular/core';

@Injectable()
export class LocalHttpClient implements HttpFacade {
    constructor(
        @Inject("Powershell") private powershell: PowershellService
    ) {}

    public request(req: Request): Observable<Response> {
        return this.powershell.invokeHttp(req)
    }

    public options(url: string): Observable<Response> {
        return this.powershell.invokeHttp(new Request({method: RequestMethod.Options, url: url}))
    }
}
