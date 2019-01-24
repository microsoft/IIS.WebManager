import { Injectable } from "@angular/core";
import { Observable, ObservableInput, OperatorFunction } from "rxjs";
import { tap } from "rxjs/operators";

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

export function logError<T>(logger: Logger, level: LogLevel): OperatorFunction<T, T> {
    return (o: Observable<T>): Observable<T> => {
        return o.pipe(tap(
            null,
            err => {
                logger.log(level, err);
            },
        ));
    };
}

@Injectable()
export class LoggerFactory {
    public Create(sender: any): Logger {
        return new ConsoleLogger(typeof sender)
    }
}
