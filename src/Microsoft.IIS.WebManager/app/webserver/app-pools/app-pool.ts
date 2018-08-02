import {Status} from '../../common/status';

export class ApplicationPool {
    name: string;
    id: string;
    status: Status;
    auto_start: boolean;
    pipeline_mode: PipelineMode
    managed_runtime_version: string;
    enable_32bit_win64: boolean;
    queue_length: number;
    cpu: Cpu;
    process_model: ProcessModel;
    identity: ApplicationPoolIdentity;
    recycling: Recycling;
    rapid_fail_protection: RapidFailProtection;
    process_orphaning: ProcessOrphaning;
    _links: any;
}

export type PipelineMode = "integrated" | "classic";
export const PipelineMode = {
    Integrated: "integrated" as PipelineMode,
    Classic: "classic" as PipelineMode
}

export class Cpu {
    limit: number;
    limit_interval: number;
    action: ProcessorAction;
    processor_affinity_enabled: boolean;
    processor_affinity_mask32: string;
    processor_affinity_mask64: string;
}


export type ProcessorAction = "KillW3wp" | "NoAction" | "Throttle" | "ThrottleUnderLoad";
export const ProcessorAction = {
    KillW3wp: "KillW3wp" as ProcessorAction,
    NoAction: "NoAction" as ProcessorAction,
    Throttle: "Throttle" as ProcessorAction,
    ThrottleUnderLoad: "ThrottleUnderLoad" as ProcessorAction
}


export class ProcessModel {
    idle_timeout: number;
    idle_timeout_action: IdleTimeoutAction;
    max_processes: number;
    pingig_enabled: boolean;
    ping_interval: number;
    ping_response_time: number;
    shutdown_time_limit: number;
    startup_time_limit: number;
}

export class ApplicationPoolIdentity {
    identity_type: ProcessModelIdentityType;
    username: string;
    password: string;
    load_user_profile: boolean;
}

export class Recycling {
    disable_overlapped_recycle: boolean;
    disable_recycle_on_config_change: boolean;
    log_events: {
        time: boolean;
        requests: boolean;
        schedule: boolean;
        memory: boolean;
        isapi_unhealthy: boolean;
        on_demand: boolean;
        config_change: boolean;
        private_memory: boolean;
    };
    periodic_restart: {
        time_interval: number;
        private_memory: number;
        request_limit: number;
        virtual_memory: number;
        schedule: Array<string>;
    };
}

export class RapidFailProtection {
    enabled: boolean;
    load_balancer_capabilities: LoadBalancerCapabilities;
    interval: number;
    max_crashes: number;
    auto_shutdown_exe: string;
    auto_shutdown_params: string;
}


export enum LoadBalancerCapabilities {
    TcpLevel = 1,
    HttpLevel
}


export class ProcessOrphaning {
    enabled: boolean;
    orphan_action_exe: string;
    orphan_action_params: string;
}




export type ProcessModelIdentityType = "LocalSystem" | "LocalService" | "NetworkService" | "SpecificUser" | "ApplicationPoolIdentity";
export const ProcessModelIdentityType = {
    LocalSystem: "LocalSystem" as ProcessModelIdentityType,
    LocalService: "LocalService" as ProcessModelIdentityType,
    NetworkService: "NetworkService" as ProcessModelIdentityType,
    SpecificUser: "SpecificUser" as ProcessModelIdentityType,
    ApplicationPoolIdentity: "ApplicationPoolIdentity" as ProcessModelIdentityType
}


enum IdleTimeoutAction {
    Terminate,
    Suspend
}
