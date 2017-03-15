import {Metadata} from '../../common/metadata';

export class Authorization {
    id: string;
    scope: string;
    metadata: Metadata;
    bypass_login_pages: boolean;
    website: any;
    _links: any;
}

export type AccessType = "allow" | "deny";
export const AccessType = {
    Allow: "allow" as AccessType,
    Deny: "deny" as AccessType
}

export class AuthRule {
    id: string;
    users: string;
    roles: string;
    verbs: string;
    access_type: AccessType;
    authorization: Authorization;
    _links: any;
}