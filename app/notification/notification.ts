export type NotificationType = "information" | "warning";
export const NotificationType = {
    Information: "information" as NotificationType,
    Warning: "warning" as NotificationType
}

export class Notification {
    type: string;
    data: any;
    componentName: string;
    module: string;
}
