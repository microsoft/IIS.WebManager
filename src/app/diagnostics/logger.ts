import { Injectable } from "@angular/core";
import { Observable, OperatorFunction } from "rxjs";
import { tap } from "rxjs/operators";
import { IsProduction } from "environments/environment";

export enum LogLevel {
    NONE = -1,
    DEBUG = 0,
    INFO,
    WARN,
    ERROR,
}

export interface Logger {
    log(level: LogLevel, msg: string)
}

class ConsoleLogger implements Logger {
    constructor(
        private senderType: string,
    ) {}

    public log(level: LogLevel, message: string) {
        var formattedMsg = `(${this.senderType}): ${message}`
        switch(level) {
            case LogLevel.DEBUG:
                console.debug(formattedMsg)
                break

            case LogLevel.INFO:
                console.info(formattedMsg)
                break

            case LogLevel.WARN:
                console.warn(formattedMsg)
                break

            case LogLevel.ERROR:
                console.error(formattedMsg)
                break

            default:
                throw `Unexpected log level ${level}`
        }
    }
}

// Debug method: pipe a observable to this method to instrument its performance
export function instrument<T>(logger: Logger, name: string): OperatorFunction<T, T> {
    if (IsProduction) {
        return (o: Observable<T>): Observable<T> => o;
    } else {
        logger.log(LogLevel.DEBUG, `${new Date().toISOString()}: ${name} scheduled`);
        return (o: Observable<T>): Observable<T> => o.pipe(tap(
            _ => {
                logger.log(LogLevel.DEBUG, `${new Date().toISOString()}: ${name} returned value`);
            },
            _ => {
                logger.log(LogLevel.DEBUG, `${new Date().toISOString()}: ${name} returned error`);
            },
            () => {
                logger.log(LogLevel.DEBUG, `${new Date().toISOString()}: ${name} completed`);
            }
        ));
    }
}

export function logError<T>(logger: Logger, level: LogLevel, message: string): OperatorFunction<T, T> {
    return (o: Observable<T>): Observable<T> =>
        o.pipe(tap(
            null,
            err => {
                logger.log(level, message);
                logger.log(level, err);
            },
        ));
}

@Injectable()
export class LoggerFactory {
    public Create(sender: any): Logger {
        return new ConsoleLogger(typeof sender)
    }
}
