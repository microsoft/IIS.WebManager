export class ApiConnection {
    public static get DefaultPort(): string { return "55539"; }
    public static get Protocol(): string { return "https"; }

    public accessToken: string;
    public displayName: string;
    public persist: boolean;

    private _url: string;
    private _id: string;

    constructor(url: string) {
        this.url = url;
        this._id = (new Date().getTime()).toString();
    }

    public static clone(data: any): ApiConnection {
        if (!data) {
            return null;
        }

        let o = <ApiConnection>(data);

        let conn = new ApiConnection(o._url);
        conn.accessToken = o.accessToken;
        conn.displayName = o.displayName;
        conn.persist = o.persist;
        conn._id = o._id;

        return conn;
    }

    public get url(): string {
        return this._url;
    }

    public id(): string {
        return this._id;
    }

    public set url(value: string) {
        this._url = "";
        this._url = value ? ApiConnection.normalizeUrl(value.trim().toLowerCase()) : "";
    }

    public hostname(): string {
        if (!this._url) {
            return undefined;
        }

        let i = this._url.indexOf("://");
        let j = this._url.lastIndexOf(":");

        if (i <= 0 || j <= 0) {
            return undefined;
        }

        i += 3;
        return this.url.substr(i, j - i);
    }

    private static normalizeUrl(url: string): string {
        if (url.indexOf("://") < 0) {
            url = ApiConnection.Protocol + "://" + url;
        }

        // Authority [0; a]
        let a = url.indexOf("/", ApiConnection.Protocol.length + 3);
        if (a < 0) {
            a = url.length;
        }

        //
        // Port [p; a]
        let p = url.lastIndexOf(":", a);
        if (url[p + 1] == '/' && url[p - 1] != ']') {
            // No port, use the default
            url = url.substr(0, a) + ":" + ApiConnection.DefaultPort + url.substr(a);
        }

        return url;
    }
}