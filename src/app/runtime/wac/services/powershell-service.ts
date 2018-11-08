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
  private onload: Observable<PowerShellSession>
  private session: PowerShellSession
  private sessionId = Math.random().toString(36).substring(2, 15) // TODO: modify this with WAC session ID

  constructor(private appContext: AppContextService) {
    this.onload = this.appContext.servicesReady.map(_ => {
      return this.session = this.appContext.powerShell.createSession(this.appContext.activeConnection.nodeName, PS_SESSION_KEY)
    })
  }

  public run<T>(pwCmdString: string, psParameters: any): Observable<T> {
    psParameters.sessionId = this.sessionId
    return this.invoke(pwCmdString, psParameters)
  }

  public invokeHttp(req: Request): Observable<Response> {
    return this.invoke<ResponseOptions>(PowerShellScripts.local_http, { requestBase64: btoa(JSON.stringify(req)) })
      .map(res => {
        let options = new ResponseOptions({
          url: res.url,
          status: res.status,
          headers: res.headers,
          body: atob(<string> res.body),
        })
        console.log(options)
        return new Response(options)
      })
  }

  private invoke<T>(pwCmdString: string, psParameters: any): Observable<T> {
    var compiled = PowerShell.createScript(pwCmdString, psParameters);
    if (this.session) {
      return this.invokeSession(this.session, compiled, pwCmdString)
    } else {
      return this.onload.mergeMap(ps => this.invokeSession(ps, compiled, pwCmdString))
    }
  }

  private invokeSession<T>(ps: PowerShellSession, script: string, name: string): Observable<T> {
    return this.appContext.powerShell.run(ps, script)
      .mergeMap(response => {
        if (!response) {
          throw `Powershell command ${name} returns no response`;
        }

        if (!response.results) {
          throw `Powershell command ${name} returns null response`;
        }

        if (response.results.length <= 0) {
          throw `Powershell command ${name} returns empty response`;
        }
        return response.results.map(result => {
          console.log(`received ${result}`)
          return JSON.parse(result)
        })
      })
  }
}
