import {DateTime} from "../common/primitives"

export class Certificate {
    id: string;
    alias: string;
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
    subject_alternative_names: Array<string>;
    store: CertStore;

    friendly_name: string; // Removed after 1.0.39
    name: string; // Removed after 1.0.39

    _links: any;

    public static friendlyValidTo(cert: Certificate) {
        if (!cert.valid_to) {
            return "";
        }

        return cert.valid_to.substring(0, 10);
    }

    public static friendlyValidFrom(cert: Certificate) {
        if (!cert.valid_from) {
            return "";
        }

        return cert.valid_from.substring(0, 10);
    }

    public static friendlyIssuedBy(cert: Certificate) {
        if (!cert.issued_by) {
            return "";
        }

        if (cert.issued_by.indexOf("CN=") == 0) {
            return cert.issued_by.substring(3, cert.issued_by.length);
        }

        return cert.issued_by;
    }

    public static displayName(cert: Certificate): string {
        return cert.name || cert.alias || cert.subject || cert.thumbprint || "";
    }
}


export class CertStore {
    name: string;
    location: string;
}
