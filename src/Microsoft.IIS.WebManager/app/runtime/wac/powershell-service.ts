import { Injectable } from '@angular/core'
import { AppContextService } from '@microsoft/windows-admin-center-sdk/angular'
import { Logging, LogLevel, PowerShell, PowerShellSession } from '@microsoft/windows-admin-center-sdk/core'

const APP_NAME = "wac-iis"
const PS_SESSION_KEY = 'wac-iis-ps-session'

@Injectable()
export class PowershellService {
  private psSession: PowerShellSession;

  constructor(private appContextService: AppContextService) {
    this.psSession = this.appContextService.powerShell.createSession(this.appContextService.activeConnection.nodeName, PS_SESSION_KEY)
  }

  public run<T>(pwCmdString: string, processFunc: (arr: Array<T>) => void, psParameters = { name: 'winrm' }) {
    let command = PowerShell.createScript(pwCmdString, psParameters);
    this.appContextService.powerShell.run(this.psSession, command).map(
      (response: any) => {
        if (!response) {
          Logging.log({ source: APP_NAME, level: LogLevel.Warning, message: 'Powershell command {0} returns no response'.format(pwCmdString)})
        } else if (!response.results) {
          Logging.log({ source: APP_NAME, level: LogLevel.Warning, message: 'Powershell command {0} returns null response'.format(pwCmdString)})
        } else if (response.results.length <= 0) {
          Logging.log({ source: APP_NAME, level: LogLevel.Warning, message: 'Powershell command {0} returns empty response'.format(pwCmdString)})
        } else {
          // TODO: any way to do this with yield/generator
          let results = new Array<T>(response.results.length)
          for (let i = 0; i < response.results.length; i++) {
            results[i] = <T> response.results[i]
          }
          return results
        }
        return null
      }
    ).subscribe(processFunc)
  }
}
