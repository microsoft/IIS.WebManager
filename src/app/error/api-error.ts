export class ApiError {
    public title: string;
    public status: number;
    public detail: string;
    public feature: string;
    public exit_code: string;
    public config_path: string;
    public scope: string;
    public name: string;
    public message: string;
    public authentication_scheme: string;
    public type: ApiErrorType;
}

export type ApiErrorType = "SectionLocked" | "NotFound" | "FeatureNotInstalled" | "Unreachable";
export const ApiErrorType = {
    SectionLocked: "SectionLocked" as ApiErrorType,
    NotFound: "NotFound" as ApiErrorType,
    FeatureNotInstalled: "FeatureNotInstalled" as ApiErrorType,
    Unreachable: "Unreachable" as ApiErrorType
}

export class UnexpectedServerStatusError {
    readonly Status: string
    constructor(s: string) {
        this.Status = s
    }
}
