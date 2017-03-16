import {Metadata} from '../../common/metadata';

export class StaticContent {
    id: string;
    scope: string;
    metadata: Metadata;
    client_cache: ClientCache;
    default_doc_footer: string;
    is_doc_footer_file_name: boolean;
    enable_doc_footer: boolean;

    website: any;
    _links: any;
}

export class ClientCache {
    max_age: number;
    control_mode: CacheControlMode;
    http_expires: string;
    control_custom: string;
    set_e_tag: boolean;
}

export type CacheControlMode = "no_control" | "disable_cache" | "use_max_age" | "use_expires";
export const CacheControlMode = {
    NoControl: "no_control" as CacheControlMode,
    DisableCache: "disable_cache" as CacheControlMode,
    UseMaxAge: "use_max_age" as CacheControlMode,
    UseExpires: "use_expires" as CacheControlMode
}

export class MimeMap {
    file_extension: string;
    id: string;
    mime_type: string;
    static_content: StaticContent;

    _links: any;
}
