import { Observable } from 'rxjs/Observable'
import { Injectable } from '@angular/core'
import { AppContextService } from '@microsoft/windows-admin-center-sdk/angular'
import { PowerShell, PowerShellSession } from '@microsoft/windows-admin-center-sdk/core'

const PS_SESSION_KEY = 'wac-iis-ps-session'

@Injectable()
export class PowershellService {
  private psSession: Promise<PowerShellSession>

  constructor(private appContext: AppContextService) {
    this.psSession = this.appContext.servicesReady.map(_ => {
      return this.appContext.powerShell.createSession(this.appContext.activeConnection.nodeName, PS_SESSION_KEY)
    }).toPromise()
  }

  public run(pwCmdString: string, psParameters = {}): Promise<any> {
    return this.psSession.then(ps =>{
        return this.appContext.powerShell.run(ps, PowerShell.createScript(pwCmdString, psParameters)).toPromise()
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
