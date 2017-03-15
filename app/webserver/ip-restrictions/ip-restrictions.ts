import {Metadata} from '../../common/metadata';

export class IpRestrictions {
    id: string;
    scope: string;
    metadata: Metadata;
    enabled: boolean = false;
    allow_unlisted: boolean;
    enable_reverse_dns: boolean;
    enable_proxy_mode: boolean;
    logging_only_mode: boolean;
    deny_action: DenyAction;

    deny_by_concurrent_requests: {
        enabled: boolean;
        max_concurrent_requests: number;
    };
    deny_by_request_rate: {
        enabled: boolean;
        max_requests: number;
        time_period: number;
    };

    website: any;
    _links: any;
}

export type DenyAction = "Forbidden" | "Abort" | "Unauthorized" | "NotFound";
export const DenyAction = {
    Forbidden: "Forbidden" as DenyAction,
    Abort: "Abort" as DenyAction,
    Unauthorized: "Unauthorized" as DenyAction,
    NotFound: "NotFound" as DenyAction
}

export class RestrictionRule {
    id: string;
    ip_address: string;
    allowed: boolean;
    subnet_mask: string;
    domain_name: string;

    ip_restriction: IpRestrictions;

    _links: any;
}

