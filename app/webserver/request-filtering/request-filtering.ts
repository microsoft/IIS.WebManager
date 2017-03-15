import {Metadata} from '../../common/metadata';
import {ApiError} from '../../error/api-error';
import {WebSite} from '../websites/site';

export class RequestFiltering {
    id: string;
    scope: string;
    metadata: Metadata;
    allow_unlisted_file_extensions: boolean;
    allow_unlisted_verbs: boolean;
    allow_high_bit_characters: boolean;
    allow_double_escaping: boolean;
    max_content_length: number;
    max_url_length: number;
    max_query_string_length: number;
    verbs: Array<any>;
    website: WebSite;
    _links: any;
}

export class FilteringRule {
    name: string;
    id: string;
    scan_url: boolean;
    scan_query_string: boolean;
    headers: Array<string>;
    file_extensions: Array<string>;
    deny_strings: Array<string>;
    request_filtering: RequestFiltering;
    _links: any;
}

export class FileExtension {
    extension: string;
    id: string;
    allow: boolean;
    request_filtering: RequestFiltering;
    _links: any;
}

export type RequestFilteringChildType = "fileExtensions" | "headerLimits" | "hiddenSegments" | "queryStrings" | "rules" | "urls";
export const RequestFilteringChildType = {
    RULES: "rules" as RequestFilteringChildType,
    HEADER_LIMITS: "headerLimits" as RequestFilteringChildType,
    FILE_EXTENSIONS: "fileExtensions" as RequestFilteringChildType,
    HIDDEN_SEGMENTS: "hiddenSegments" as RequestFilteringChildType,
    QUERY_STRINGS: "queryStrings" as RequestFilteringChildType,
    URLS: "urls" as RequestFilteringChildType
}

export class RequestFilteringSettings {
    feature: RequestFiltering;

    fileExtensions: Array<FileExtension>;
    fileExtensionsError: ApiError;

    headerLimits: Array<any>;
    headerLimitsError: ApiError;

    hiddenSegments: Array<any>;
    hiddenSegmentsError: ApiError;

    queryStrings: Array<any>;
    queryStringsError: ApiError;

    rules: Array<FilteringRule>;
    rulesError: ApiError;
    
    urls: Array<any>;
    urlsError: ApiError;
}