import { Injectable } from "@angular/core";

export enum LogLevel {
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

@Injectable()
export class LoggerFactory {
    public Create(sender: any): Logger {
        return new ConsoleLogger(typeof sender)
    }
}
