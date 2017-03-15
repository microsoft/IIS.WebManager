import {Metadata} from '../../common/metadata';

export class HttpResponseHeaders {
    id: string;
    scope: string;
    metadata: Metadata;
    allow_keep_alive: boolean;

    website: any;
    _links: any;
}

export class CustomHeader {
    name: string;
    value: string;
    id: string;
    http_response_headers: HttpResponseHeaders;

    _links: any;
}

export class RedirectHeader {
    name: string;
    value: string;
    id: string;
    http_response_headers: HttpResponseHeaders;

    _links: any;
}