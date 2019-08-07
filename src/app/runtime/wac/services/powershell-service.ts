import { Injectable, Inject } from '@angular/core'
import { AppContextService } from '@microsoft/windows-admin-center-sdk/angular'
import { PowerShell, PowerShellSession, PowerShellResult } from '@microsoft/windows-admin-center-sdk/core'
import { Observable } from 'rxjs'
import { PowerShellScripts } from 'generated/powershell-scripts'
import { Request, Response, ResponseOptions, Headers } from '@angular/http'
import { WACInfo } from 'runtime/runtime.wac'
import { LoggerFactory, Logger, LogLevel, logError, instrument } from 'diagnostics/logger'
import { map, mergeMap, shareReplay, catchError } from 'rxjs/operators'
import { IsProduction } from 'environments/environment';

const PS_SESSION_KEY = 'wac-iis'

@Injectable()
export class PowershellService {
  private logger: Logger
  private session: Observable<PowerShellSession>
  private sessionId = Math.random().toString(36).substring(2, 15) // TODO: modify this with WAC session ID

  constructor(
    loggerFactory: LoggerFactory,
    private appContext: AppContextService,
    @Inject('WACInfo') private wac: WACInfo,
  ) {
    this.scheduleSession()
    // not exactly sure why we need to force evaluate this observable here
    // but if we don't, install page would not work
    this.session.subscribe()
    this.logger = loggerFactory.Create(this)
  }

  private scheduleSession() {
    this.session = this.wac.NodeName.pipe(
      map(nodeName => this.appContext.powerShell.createSession(nodeName, PS_SESSION_KEY)),
      shareReplay()
    )
  }

  public Reset() {
    this.session.subscribe(s => {
      s.dispose()
      this.scheduleSession()
    })
  }

  public run<T>(pwCmdString: string, psParameters: any, requireCredSSP: boolean = false): Observable<T> {
    return this.invokeAndParse(pwCmdString, psParameters, null, requireCredSSP)
  }

  public createCredSSPSession(): Observable<PowerShellSession> {
    return this.appContext.credSSPManager.enableDelegation(
      "Enable credSSP for this operation",
      this.appContext.activeConnection.nodeName,
    ).pipe(
      map(status => {
        if (!status) {
          this.logger.log(LogLevel.WARN, `CredSSP manager did not return true`);
        }
        return this.appContext.powerShell.createAutomaticSession(
          this.appContext.activeConnection.nodeName, {
            authenticationMechanism: 'Credssp',
          });
      })
    );
  }

  public invokeHttp(req: Request): Observable<Response> {
    req["_bodyUint8Array"] = null;
    if (req["_body"] instanceof ArrayBuffer) {
      // If _body is ArrayBuffer type value, we should use req._body_Unit8Array instead of req._body because only Uint8Array supports JSON.stringify.
      req["_bodyUint8Array"] = new Uint8Array(req["_body"]);
      req["_bodyUint8ArrayLength"] = req["_bodyUint8Array"]["length"];
      req["_body"] = null;
    }
    let requestEncoded = btoa(JSON.stringify(req));
    return this.invokeAndParse<ResponseOptions>(
      PowerShellScripts.Invoke_LocalHttp.script,
      { requestBase64: requestEncoded },
      (k, v) => {
        switch (k) {
          case 'body':
            try {
              if (req.headers.get('waciisflags') === 'GetFileSystemContent') {
                return v;
              }
              return atob(v);
            } catch {
              return v;
            }

          case 'headers':
            // we need to explicitly wrap it otherwise when we pass it to new Response(res), the header would remain a plain object
            return new Headers(v);

          default:
            return v;
        }
      }).pipe(map(res => {
        let response = new Response(res);
        if (res.status < 200 || res.status >= 400) {
          throw response;
        }
        return response;
    }))
  }

  public invoke(pwCmdString: string, psParameters: any, requireCredSSP: boolean = false): Observable<any[]>{
    psParameters.sessionId = this.sessionId;
    var flags: string[] = IsProduction ? [] : [ 'verbose' ];
    var compiled: string = PowerShell.createScript(pwCmdString, psParameters, flags);
    var scriptName: string = pwCmdString.split("\n")[0]
    var session = requireCredSSP ? this.createCredSSPSession() : this.session;
    return session.pipe(
      mergeMap(ps => ps.powerShell.run(compiled)),
      instrument(this.logger, `${scriptName} => ${JSON.stringify(psParameters)}`),
      logError(this.logger, LogLevel.WARN, `Script ${scriptName} failed`),
      map((response: PowerShellResult) => {
        if (!response) {
          throw `Powershell command ${scriptName} returns no response`;
        }
        if (response.warning) {
          this.logger.log(LogLevel.WARN, `Powershell command ${scriptName} returns the following warnings`)
          for (const line of response.warning) {
            this.logger.log(LogLevel.WARN, line);
          }
        }
        if (response.errors) {
          this.logger.log(LogLevel.ERROR, `Powershell command ${scriptName} returns the following errors`)
          for (const line of response.errors) {
            this.logger.log(LogLevel.ERROR, line);
          }
        }
        if (!response.results) {
          throw `Powershell command ${scriptName} returns null response`;
        }
        if (response.results.length <= 0) {
          throw `Powershell command ${scriptName} returns empty response`;
        }
        return response.results;
      }),
      catchError((e, _) => {
        let rethrow = e;
        // WAC wrap the powershell error (or exception) message around this AjaxError object. We would unwrap it for easier readability
        if (e.name == "AjaxError" && e.status == 400) {
          if (e.response.error && !e.response.exception) {
            rethrow = e.response.error;
          } 
          if (!e.response.error && e.response.exception) {
            rethrow = e.response.exception;
          }
        }
        throw rethrow;
      }),
    );
  }

  private invokeAndParse<T>(pwCmdString: string, psParameters: any, reviver: (key: any, value: any) => any = null, requireCredSSP: boolean = false): Observable<T> {
    return this.invoke(pwCmdString, psParameters, requireCredSSP).pipe(
      mergeMap(
        lines => lines.map(line => {
          let rtnObject = JSON.parse(line, reviver);
          if (rtnObject && rtnObject.errorsReported) {
            this.logger.log(LogLevel.ERROR, `Unexpected error from powershell script ${name}:\n${rtnObject.errorsReported}`);
          }
          return <T> rtnObject;
        })
      ),
    );
  }
}
