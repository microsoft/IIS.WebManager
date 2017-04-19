import {Status} from '../../common/status';
import {Certificate} from '../../certificates/certificate'


export class WebSite {
    name: string;
    id: string;
    physical_path: string;
    key: number;
    status: Status;
    server_auto_start: boolean;
    enabled_protocols: string;
    limits: Limits;
    failed_request_tracing: RequestTracing;
    bindings: Array<Binding>;
    application_pool: any;

    _links: any;
}

export class Limits {
    connection_timeout: number;
    max_bandwidth: number;
    max_connections: number;
    max_url_segments: number;
}

class RequestTracing {
    enabled: boolean;
    directory: string;
    maximum_number_trace_files: number;
}

export class Binding {
    ip_address: string;
    port: number;
    hostname: string;
    require_sni: boolean;
    is_https: boolean;
    protocol: string; // required
    binding_information: boolean;
    certificate: Certificate;
}
