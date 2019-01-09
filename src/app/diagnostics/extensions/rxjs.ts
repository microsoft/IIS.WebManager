import { Observable } from 'rxjs'
import { environment } from 'environments/environment'
import { Logger, LogLevel } from 'diagnostics/logger'

export enum ObservableReportLevel {
    COMPLETE = 1,
    SUCCESS = 1 << 1,
    ERROR = 1 << 2,
}

declare module 'rxjs/Observable' {
    interface Observable<T> {
        logDebug<T>(
            this: Observable<T>,
            logger: Logger,
            identifier: string,
        ): Observable<T>

        logDebug<T>(
            this: Observable<T>,
            logger: Logger,
            identifier: string,
            level: ObservableReportLevel,
        ): Observable<T>

        logInfo<T>(
            this: Observable<T>,
            logger: Logger,
            identifier: string,
        ): Observable<T>

        logInfo<T>(
            this: Observable<T>,
            logger: Logger,
            identifier: string,
            level: ObservableReportLevel,
        ): Observable<T>

        logWarning<T>(
            this: Observable<T>,
            logger: Logger,
            identifier: string,
        ): Observable<T>

        logWarning<T>(
            this: Observable<T>,
            logger: Logger,
            identifier: string,
            level: ObservableReportLevel,
        ): Observable<T>

        logError<T>(
            this: Observable<T>,
            logger: Logger,
            identifier: string,
        ): Observable<T>

        logError<T>(
            this: Observable<T>,
            logger: Logger,
            identifier: string,
            level: ObservableReportLevel,
        ): Observable<T>
    }
}

function log<T>(
    o: Observable<T>,
    logLevel: LogLevel,
    logger: Logger,
    identifier: string,
    reportLevel: ObservableReportLevel,
): Observable<T> {
    if (environment.Production && logLevel < LogLevel.WARN) {
        return o
    }
    return o.do(
        v => {
            if (reportLevel & ObservableReportLevel.SUCCESS) {
                logger.log(logLevel, `${identifier} succeeded, result: ${JSON.stringify(v)}`)
            }
        },
        e => {
            if (reportLevel & ObservableReportLevel.ERROR) {
                logger.log(logLevel, `${identifier} failed, exception: ${JSON.stringify(e)}`)
            }
        },
        () => {
            if (reportLevel & ObservableReportLevel.COMPLETE) {
                logger.log(logLevel, `${identifier} completed`)
            }
        }
    )
}

export function debug<T>(
    this: Observable<T>,
    logger: Logger,
    identifier: string,
    level: ObservableReportLevel = ObservableReportLevel.ERROR | ObservableReportLevel.SUCCESS,
): Observable<T> {
    return log(this, LogLevel.DEBUG, logger, identifier, level)
}

export function info<T>(
    this: Observable<T>,
    logger: Logger,
    identifier: string,
    level: ObservableReportLevel = ObservableReportLevel.ERROR | ObservableReportLevel.SUCCESS,
): Observable<T> {
    return log(this, LogLevel.INFO, logger, identifier, level)
}

export function warn<T>(
    this: Observable<T>,
    logger: Logger,
    identifier: string,
    level: ObservableReportLevel = ObservableReportLevel.ERROR,
): Observable<T> {
    return log(this, LogLevel.WARN, logger, identifier, level)
}

export function error<T>(
    this: Observable<T>,
    logger: Logger,
    identifier: string,
    level: ObservableReportLevel = ObservableReportLevel.ERROR,
): Observable<T> {
    return log(this, LogLevel.ERROR, logger, identifier, level)
}

Observable.prototype.logDebug = debug
Observable.prototype.logInfo = info
Observable.prototype.logWarning = warn
Observable.prototype.logError = error
