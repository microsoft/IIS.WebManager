import {Metadata} from '../../common/metadata';

export class Modules {
    id: string;
    scope: string;
    metadata: Metadata;
    run_all_managed_modules_for_all_requests: boolean;

    website: any;
    _links: any;
}

export class LocalModule {
    name: string;
    id: string;
    type: string;
    precondition: string;
    locked: boolean;

    modules: Modules;
}

export class GlobalModule {
    name: string;
    id: string;
    image: string;
    precondition: string;
}

export type ModuleType = "managed" | "native";
export const ModuleType = {
    Managed: "managed" as ModuleType,
    Native: "native" as ModuleType
}
