import { ErrorHandler, Injectable } from "@angular/core";
import { LoggerFactory, Logger, LogLevel } from "./logger";

@Injectable()
export class LogsErrorHandler implements ErrorHandler {
    private _logger: Logger

    constructor(factory: LoggerFactory) {
        this._logger = factory.Create(this)
    }

    public handleError(error): void {
        let msg: any = error
        if (error.rejection) {
            msg = JSON.stringify(error.rejection)
        }
        this._logger.log(LogLevel.ERROR, msg)
    }
}
