export class Metadata {
    is_local: boolean;
    is_locked: boolean;
    override_mode: OverrideMode;
    override_mode_effective: OverrideMode;
}    

export type OverrideMode = "allow" | "deny" | "inherit";
export const OverrideMode = {
    ALLOW: "allow" as OverrideMode,
    DENY: "deny" as OverrideMode,
    INHERIT: "inherit" as OverrideMode
}
