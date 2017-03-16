import {WebApp} from '../webapps/webapp';
import {WebSite} from '../websites/site';

export type LogonMethod = "interactive" | "batch" | "network" | "network_cleartext";
export const LogonMethod = {
    Interactive: "interactive" as LogonMethod,
    Batch: "batch" as LogonMethod,
    Network: "network" as LogonMethod,
    NetworkCleartext: "network_cleartext" as LogonMethod
}

export class VdirIdentity {
    username: string;
    logon_method: LogonMethod;
    password: string;
}

export class Vdir {
    location: string;
    path: string;
    id: string;
    physical_path: string;
    identity: VdirIdentity;
    webapp: WebApp;
    website: WebSite;
}
