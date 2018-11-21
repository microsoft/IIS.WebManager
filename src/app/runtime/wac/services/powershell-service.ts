import { Injectable } from '@angular/core'
import { AppContextService } from '@microsoft/windows-admin-center-sdk/angular'
import { PowerShell, PowerShellSession } from '@microsoft/windows-admin-center-sdk/core'
import 'rxjs/add/operator/catch'
import { Observable } from 'rxjs'
import { PowerShellScripts } from '../../../../generated/powershell-scripts'
import { Request, Response, ResponseOptions, Headers } from '@angular/http'
import { WACInfo } from 'runtime/runtime.wac';

const PS_SESSION_KEY = 'wac-iis'

@Injectable()
export class PowershellService {
  private session: Observable<PowerShellSession>
  private sessionId = Math.random().toString(36).substring(2, 15) // TODO: modify this with WAC session ID
  private reqId = 0

  constructor(
    private appContext: AppContextService,
    private wac: WACInfo,
  ) {
    this.session = this.wac.NodeName.map(nodeName => {
      return this.appContext.powerShell.createSession(nodeName, PS_SESSION_KEY)
    }).shareReplay(1)
    // not exactly sure why we need to force evaluate this observable here
    // but if we don't, install page would not work
    let sub = this.session.subscribe(_=>{},_=>{}, ()=>{ sub.unsubscribe() })
  }

  public run<T>(pwCmdString: string, psParameters: any): Observable<T> {
    this.reqId++
    psParameters.sessionId = this.sessionId
    return this.invoke(pwCmdString, psParameters)
  }

  public invokeHttp(req: Request): Observable<Response> {
    let requestEncoded = btoa(JSON.stringify(req))
    var id = this.reqId++
    console.log(`request ${id} ${JSON.stringify(req)} scheduled`)
    return this.invoke<ResponseOptions>(
      PowerShellScripts.local_http,
      { requestBase64: requestEncoded },
      (k, v) => {
        if (k === "body") {
          try {
            return atob(v)
          } catch {
            return v
          }
        } else if (k === "headers") {
          // we need to explicitly wrap it otherwise when we pass it to new Response(res), the header would remain a plain object
          return new Headers(v)
        }
        return v
      }).map(res => {
        let response = new Response(res)
        console.log(`response ${id}: ${JSON.stringify(res)}\nrequest ${JSON.stringify(req)}`)
        if (res.status < 200 || res.status >= 400) {
          throw response
        }
        return response
    })
  }

  private invoke<T>(pwCmdString: string, psParameters: any, reviver: (key: any, value: any) => any = null): Observable<T> {
    var compiled = PowerShell.createScript(pwCmdString, psParameters)
    var name = pwCmdString.split('\n')[0]
    return this.session.mergeMap(ps => ps.powerShell.run(compiled).mergeMap(response => {
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
    }))
  }
}
