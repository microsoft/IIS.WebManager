import { Injectable } from '@angular/core'
import { AppContextService } from '@microsoft/windows-admin-center-sdk/angular'
import { PowerShell, PowerShellSession } from '@microsoft/windows-admin-center-sdk/core'
import 'rxjs/add/operator/catch'
import { Observable, Subscriber } from 'rxjs'
import { ObservableInput } from 'rxjs/Observable'
import { PowerShellScripts } from '../../../../generated/powershell-scripts'
import { Request, Response, ResponseOptions } from '@angular/http'

const PS_SESSION_KEY = '475e8b48-d4c4-4624-b719-f041067cb5fb'

@Injectable()
export class PowershellService {
  private psSession: Promise<PowerShellSession>
  private sessionId = Math.random().toString(36).substring(2, 15) // TODO: modify this with WAC session ID

  constructor(private appContext: AppContextService) {
    this.psSession = this.appContext.servicesReady.map(_ => {
      return this.appContext.powerShell.createSession(this.appContext.activeConnection.nodeName, PS_SESSION_KEY)
    }).toPromise()
  }

  public run<T>(pwCmdString: string, psParameters: any): Observable<T> {
    psParameters.sessionId = this.sessionId
    return new Observable<T>(o => {
      this.emit(pwCmdString, psParameters, o)
    })
  }

  public invokeHttp(req: Request): Observable<Response> {
    return new Observable(o => {
      this.emit<ResponseOptions>(PowerShellScripts.local_http, {
        requestBase64: btoa(JSON.stringify(req)),
      }, o)
    }).map((res: ResponseOptions, _) => new Response(res))
  }

  private async emit<T>(pwCmdString: string, psParameters: any, observer: Subscriber<T>) {
    var ps = await this.psSession
    var script = PowerShell.createScript(pwCmdString, psParameters)
    this.appContext.powerShell.run(ps, script).catch((e, _) => {
      console.log(`error on powershell script`)
      console.log(JSON.stringify(e))
      if (psParameters.requestBase64) {
        console.log(`error request: ${psParameters.requestBase64}`)
        console.log(`${atob(psParameters.requestBase64)}`)
      }
      observer.error(e)
      try {
        return Observable.throw(e)
      } finally {
        observer.unsubscribe()
      }
    }).subscribe(response => {
      if (!response) {
        throw `Powershell command ${pwCmdString} returns no response`
      }

      if (!response.results) {
        throw `Powershell command ${pwCmdString} returns null response`
      }

      if (response.results.length <= 0) {
        throw `Powershell command ${pwCmdString} returns empty response`
      }
      for (let result of response.results) {
        if (result) {
          observer.next(JSON.parse(result))
        }
      }
      observer.complete()
      observer.unsubscribe()
    })
  }
}
