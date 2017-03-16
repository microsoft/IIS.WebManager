import {Metadata} from '../../common/metadata';

export class AnonymousAuthentication {
    id: string;
    enabled: boolean;
    scope: string;
    metadata: Metadata;
    user: string;

    website: any;
    _links: any;
}

export class BasicAuthentication {
    id: string;
    enabled: boolean;
    scope: string;
    metadata: Metadata;
    default_logon_domain: string;
    realm: string;

    website: any;
    _links: any;
}

export class DigestAuthentication {
    id: string;
    enabled: boolean;
    scope: string;
    metadata: Metadata;
    realm: string;

    website: any;
    _links: any;
}

export class WindowsAuthentication {
    id: string;
    enabled: boolean;
    scope: string;
    metadata: Metadata;
    use_kernel_mode: boolean;
    token_checking: TokenCheking;
    providers: Array<Provider>;

    website: any;
    _links: any;
}

export class Provider {
    name: string;
    enabled: boolean;
}

export type TokenCheking = "None" | "Allow" | "Require";
export const TokenCheking = {
    None: "None" as TokenCheking,
    Allow: "Allow" as TokenCheking,
    Require: "Require" as TokenCheking,
}
