export class Int16 {
    public static get Max(): number { return 32767; }
    public static get Min(): number { return -32768; }
}

export class Int32 {
    public static get Max(): number { return 2147483647; }
    public static get Min(): number { return -2147483648; }
}

export class UInt32 {
    public static get Max(): number { return 4294967295; }
    public static get Min(): number { return 0; }
}

export class Int64 {
    public static get Max(): number { return 9223372036854775807; }
    public static get Min(): number { return -9223372036854775808; }
}

export class TimeSpan {
    public static get MaxDays(): number { return 300; }
    public static get MaxHours(): number { return TimeSpan.MaxDays * 24; }
    public static get MaxMinutes(): number { return TimeSpan.MaxHours * 60; }
    public static get MaxSeconds(): number { return TimeSpan.MaxMinutes * 60; }
}


export type DateTimeUnit = "years" | "months" | "weeks" | "days" | "hours" | "minutes" | "seconds";
export const DateTimeUnit = {
    Years: "years" as DateTimeUnit,
    Months: "months" as DateTimeUnit,
    Weeks: "weeks" as DateTimeUnit,
    Days: "days" as DateTimeUnit,
    Hours: "hours" as DateTimeUnit,
    Minutes: "minutes" as DateTimeUnit,
    Seconds: "seconds" as DateTimeUnit
}

export class DateTime {
    private static _milisecondsPer = {
        weeks: 7 * 24 * 60 * 60 * 1000,
        days: 24 * 60 * 60 * 1000,
        hours: 60 * 60 * 1000,
        minutes: 60 * 1000,
        seconds: 1000
    };

    public static get UtcNow(): Date {
        let now = new Date();
        return new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getHours(), now.getMinutes(), now.getSeconds());
    }

    public static diff(from: Date, to: Date, unit: DateTimeUnit): number {
        return Math.floor((<any>to - <any>from) / DateTime._milisecondsPer[unit]); 
    }
}

export class Humanizer {
    private static _dateFormatter = new Intl.DateTimeFormat([], {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric"
    });

    public static number(val: number): string {
        let groupSize: number = 3;
        let nStr: string = '' + val;
        let mod: number = nStr.length % groupSize;

        //
        // Pad with leading spaces to make length a multiple of groupSize
        for (let i = 0; mod > 0 && i < groupSize - (mod); i++) {
            nStr = ' ' + nStr;
        }

        var groups = [];

        for (let i = 0; i < nStr.length; i += groupSize) {
            groups.push(nStr.substr(i, groupSize));
        }

        return groups.join(",").trim();
    }

    public static memory(val: number) {

        const units = ['B', 'KB', 'MB', 'GB'];

        let i = 0;


        while (val > 1024) {
            val /= 1024;
            i++;
        }

        return Math.floor(val) + ' ' + units[i];
    }

    public static date(date: Date): string {
        return date ? Humanizer._dateFormatter.format(date) : "";
    }
}


export const ALL: any[] = [
    Int16,
    Int32,
    UInt32,
    Int64,
    TimeSpan,
    DateTime,
    DateTimeUnit
];
