import {DateTime} from "../common/primitives"

export class Certificate {
    id: string;
    name: string;
    friendly_name: string;
    dns_name: string;
    simple_name: string;
    issued_by: string;
    subject: string;
    thumbprint: string;
    hash_algorithm: string;
    valid_to: string;
    valid_from: string;
    version: string;    
    intended_purposes: Array<string>;
    store: CertStore;

    _links: any;
}


export class CertStore {
    name: string;
    location: string;
}