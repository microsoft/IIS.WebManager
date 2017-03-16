export type Status = "unknown" | "stopping" | "stopped" | "starting" | "started";
export const Status = {
    Unknown: "unknown" as Status,
    Stopping: "stopping" as Status,
    Stopped: "stopped" as Status,
    Starting: "starting" as Status,
    Started: "started" as Status
}
