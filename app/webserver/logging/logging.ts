import {Metadata} from '../../common/metadata';

export class Logging {
    id: string;
    scope: string;
    metadata: Metadata;
    enabled: boolean;
    log_per_site: boolean;
    directory: string;
    log_file_encoding: Encoding;
    log_file_format: LogFileFormat;
    log_target: LogTarget;
    log_fields: LogFelds;
    custom_log_fields: CustomLogField[];
    rollover: {
        period: LogPeriod;
        truncate_size: number;
        use_local_time: boolean;
    };
    website: any;
    _links: any;
}


export type Encoding = "utf-8" | "ansi";
export const Encoding = {
    UTF8: "utf-8" as Encoding,
    ANSI: "ansi" as Encoding
}

export type LogFileFormat = "w3c" | "iis" | "ncsa" | "custom" | "binary";
export const LogFileFormat = {
    W3C: "w3c" as LogFileFormat,
    IIS: "iis" as LogFileFormat,
    NCSA: "ncsa" as LogFileFormat,
    Custom: "custom" as LogFileFormat,
    Binary: "binary" as LogFileFormat
}

export class LogTarget {
    etw: boolean;
    file: boolean;
}

export class LogFelds {
    date: boolean;
    time: boolean;
    client_ip: boolean;
    username: boolean;
    site_name: boolean;
    computer_name: boolean;
    server_ip: boolean;
    method: boolean;
    uri_stem: boolean;
    uri_query: boolean;
    http_status: boolean;
    win_32_status: boolean;
    bytes_sent: boolean;
    bytes_recv: boolean;
    time_taken: boolean;
    server_port: boolean;
    user_agent: boolean;
    cookie: boolean;
    referer: boolean;
    protocol_version: boolean;
    host: boolean;
    http_sub_status: boolean;
}

export class CustomLogField {
    field_name: string;
    source_name: string;
    source_type: CustomLogFieldSourceType = CustomLogFieldSourceType.RequestHeader;
}

export type CustomLogFieldSourceType = "request_header" | "response_header" | "server_variable";
export const CustomLogFieldSourceType = {
    RequestHeader: "request_header" as CustomLogFieldSourceType,
    ResponseHeader: "response_header" as CustomLogFieldSourceType,
    ServerVariable: "server_variable" as CustomLogFieldSourceType
}

export type LogPeriod = "hourly" | "daily" | "weekly" | "monthly";
export const LogPeriod = {
    Hourly: "hourly" as LogPeriod,
    Daily: "daily" as LogPeriod,
    Weekly: "weekly" as LogPeriod,
    Monthly: "monthly" as LogPeriod
}
