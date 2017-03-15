import { Metadata } from '../../common/metadata';
import { ApiFile } from '../../files/file'

export class RequestTracing {
    id: string;
    scope: string;
    metadata: Metadata;
    enabled: boolean;
    directory: string;
    maximum_number_trace_files: number;

    website: any;
    _links: any;
}

export class Provider {
    name: string;
    id: string;
    guid: string;
    areas: Array<string>;
    request_tracing: RequestTracing;

    _links: any;
}

export class RequestTracingRule {
    path: string;
    id: string;
    status_codes: Array<string>;
    min_request_execution_time: number;
    event_severity: EventSeverity;
    custom_action: CustomAction;
    traces: Array<Trace>;
    request_tracing: RequestTracing;

    _links: any;
}

export class CustomAction {
    executable: string;
    params: string;
    trigger_limit: number;
}

export class Trace {
    allowed_areas: any;
    provider: Provider;
    verbosity: Verbosity;
}

export class TraceLog {
    public id: string;
    public url: string;
    public method: string;
    public status_code: number;
    public date: Date;
    public time_taken: number;
    public process_id: string;
    public activity_id: string;
    public file_info: ApiFile
    public request_tracing: RequestTracing;

    public static FromApiFile(fileInfo: ApiFile): TraceLog {
        let l = new TraceLog();
        l.file_info = fileInfo;
        return l;
    }

    public static FromObj(obj: any): TraceLog {
        if (!obj) {
            return null;
        }

        let log: TraceLog = new TraceLog();
        Object.assign(log, obj);

        log.date = obj.date ? new Date(<string>obj.date) : null;
        log.file_info = ApiFile.fromObj(log.file_info);

        return log;
    }
}

export type EventSeverity = "ignore" | "criticalerror" | "error" | "warning";
export const EventSeverity = {
    Ignore: "ignore" as EventSeverity,
    CriticalError: "criticalerror" as EventSeverity,
    Error: "error" as EventSeverity,
    Warning: "warning" as EventSeverity
}

export type Verbosity = "general" | "criticalerror" | "error" | "warning" | "information" | "verbose";
export const Verbosity = {
    General: "general" as Verbosity,
    CriticalError: "criticalerror" as Verbosity,
    Error: "error" as Verbosity,
    Warning: "warning" as Verbosity,
    Information: "information" as Verbosity,
    Verbose: "verbose" as Verbosity
}