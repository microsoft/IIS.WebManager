import { Injectable } from '@angular/core'
import { AppContextService } from '@microsoft/windows-admin-center-sdk/angular'
import { PowerShell, PowerShellSession } from '@microsoft/windows-admin-center-sdk/core'
import 'rxjs/add/operator/catch'
const PS_SESSION_KEY = 'wac-iis-ps-session'

@Injectable()
export class PowershellService {
  private psSession: Promise<PowerShellSession>
  private sessionId = Math.random().toString(36).substring(2, 15) // TODO: modify this with WAC session ID

  constructor(private appContext: AppContextService) {
    this.psSession = this.appContext.servicesReady.map(_ => {
      return this.appContext.powerShell.createSession(this.appContext.activeConnection.nodeName, PS_SESSION_KEY)
    }).toPromise()
  }

  public run(pwCmdString: string, psParameters: any): Promise<any> {
    return this.psSession.then(ps =>{
        psParameters.sessionId = this.sessionId
        var script = PowerShell.createScript(pwCmdString, psParameters)
        return this.appContext.powerShell.run(ps, script).catch((e, _) => {
          throw e
        }).toPromise()
      })
      .then(response => {
        if (!response) {
          throw `Powershell command ${pwCmdString} returns no response`
        }

        if (!response.results) {
          throw `Powershell command ${pwCmdString} returns null response`
        }

        if (response.results.length <= 0) {
          throw `Powershell command ${pwCmdString} returns empty response`
        }

        return response.results
      })
  }
}
