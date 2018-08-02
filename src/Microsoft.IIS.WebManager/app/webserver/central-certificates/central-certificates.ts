export class CentralCertificateConfiguration {
    constructor() {
        this.id = null;
        this.path = null;
        this.identity = {
            username: null,
            password: null
        };
        this.private_key_password = null;
        this._links = null;
    }

    public id: string;
    public path: string;
    public identity: {
        username: string,
        password: string
    };
    public private_key_password: string;
    public _links: any;
}