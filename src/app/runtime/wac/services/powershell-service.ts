import { Injectable } from '@angular/core'
import { AppContextService } from '@microsoft/windows-admin-center-sdk/angular'
import { PowerShell, PowerShellSession } from '@microsoft/windows-admin-center-sdk/core'
import 'rxjs/add/operator/catch'
import { Observable } from 'rxjs'
import { PowerShellScripts } from '../../../../generated/powershell-scripts'
import { Request, Response, ResponseOptions } from '@angular/http'

const PS_SESSION_KEY = '475e8b48-d4c4-4624-b719-f041067cb5fb'

@Injectable()
export class PowershellService {
  private onload: Observable<PowerShellSession>
  private session: PowerShellSession
  private sessionId = Math.random().toString(36).substring(2, 15) // TODO: modify this with WAC session ID

  private requestCount = 0

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
    let c = this.requestCount++
    console.log(`request ${c}, content: ${JSON.stringify(req)}`)
    return this.invoke<ResponseOptions>(
      PowerShellScripts.local_http,
      { requestBase64: btoa(JSON.stringify(req)) },
      (k, v) => {
        if (k === "body") {
          return atob(v)
        }
        return v
      }).map(res => {
        console.log(`request ${c} received response ${JSON.stringify(res)}`)
        return new Response(res)
      })
  }

  private invoke<T>(pwCmdString: string, psParameters: any, reviver: (key: any, value: any) => any = null): Observable<T> {
    var compiled = PowerShell.createScript(pwCmdString, psParameters)
    var name = pwCmdString.split('\n')[0]
    if (this.session) {
      return this.invokeSession(this.session, compiled, name, reviver)
    } else {
      return this.onload.mergeMap(ps => this.invokeSession(ps, compiled, name, reviver))
    }
  }

  private invokeSession<T>(ps: PowerShellSession, script: string, name: string, reviver: (key: any, value: any) => any): Observable<T> {
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
          return JSON.parse(result, reviver)
        })
      })
  }
}
