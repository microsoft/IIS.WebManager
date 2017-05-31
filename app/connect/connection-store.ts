import {ApiConnection} from './api-connection';
import {HttpClient} from '../common/httpclient';

import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";


export class ConnectionStore {
    private static CONNECTIONS_KEY: string = "ConnectionStore:Connections";
    private static ACTIVE_KEY: string = "ConnectionStore:ActiveConnection";

    private _connections: BehaviorSubject<Array<ApiConnection>> = new BehaviorSubject<Array<ApiConnection>>([]);
    private _active: BehaviorSubject<ApiConnection> = new BehaviorSubject<ApiConnection>(null);

    constructor() {
        try {
            this.load();
        }
        catch (e) {
            console.log(e);
        }
    }

    get connections(): Observable<Array<ApiConnection>> {
        return this._connections.asObservable();
    }

    get active(): Observable<ApiConnection> {
        return this._active.asObservable();
    }

    public save(conn: ApiConnection): ApiConnection {
        let connection: ApiConnection;

        for (var c of this._data) {
            if (c.id() == conn.id()) {
                connection = c;
                break;
            }
        }

        if (connection) {
            //
            // Update existing
            for (var k in conn) connection[k] = conn[k]; // Copy

            this.store();
        }
        else {
            //
            // Add new
            this._data.push(conn);

            this.store();

            this._connections.next(this._data);

            connection = conn;
        }

        return connection;
    }

    public delete(conn: ApiConnection) {
        if (this._activeConn && this._activeConn.id() == conn.id()) {
            this.setActive(null);
        }

        for (var i = 0; i < this._data.length; ++i) {
            if (this._data[i].id() == conn.id()) {
                this._data.splice(i, 1);
                conn.url = conn.accessToken = conn.displayName = conn.persist = undefined;

                this.store();
                this._connections.next(this._data);

                break;
            }
        }
    }

    public setActive(conn: ApiConnection) {
        //
        // Update the store
        try {
            if (!this._activeConn) {
                sessionStorage.removeItem(ConnectionStore.ACTIVE_KEY);
                localStorage.removeItem(ConnectionStore.ACTIVE_KEY);
            }

            if (conn) {
                sessionStorage.setItem(ConnectionStore.ACTIVE_KEY, conn.id());

                if (conn.persist) {
                    localStorage.setItem(ConnectionStore.ACTIVE_KEY, conn.id());
                }
            }
        }
        catch (e) {
            console.log(e);
        }

        this._active.next(conn);
    }

    private get _data(): Array<ApiConnection> {
        return this._connections.getValue();
    }

    private get _activeConn(): ApiConnection {
        return this._active.getValue();
    }

    private load() {
        let arr: Array<ApiConnection>;

        //
        // Load from session storage
        arr = JSON.parse(sessionStorage.getItem(ConnectionStore.CONNECTIONS_KEY));
        if (arr) {
            for (var c of arr) {
                let conn = ApiConnection.clone(c);
                conn.persist = false;

                this._data.push(conn);
            }
        }

        //
        // Load from local storage
        arr = JSON.parse(localStorage.getItem(ConnectionStore.CONNECTIONS_KEY));
        if (arr) {
            for (var c of arr) {
                let conn = ApiConnection.clone(c);
                conn.persist = true;

                this._data.push(conn);
            }
        }

        //
        // Get active
        let activeId: string = sessionStorage.getItem(ConnectionStore.ACTIVE_KEY) || localStorage.getItem(ConnectionStore.ACTIVE_KEY);
        let conns = activeId ? this._data.filter(c => c.id() == activeId) : [];
        if (conns.length > 0) {
            this.setActive(conns[0]);
        }
        else {
            if (this._data.length > 0) {
                this.setActive(this._data[0]);
            }
        }
    }

    private store() {
        let persisted: Array<ApiConnection> = [];
        let session: Array<ApiConnection> = [];

        this._data.forEach(conn => conn.persist ? persisted.push(conn) : session.push(conn));

        //
        // Update storage
        try {
            sessionStorage.setItem(ConnectionStore.CONNECTIONS_KEY, JSON.stringify(session));
            localStorage.setItem(ConnectionStore.CONNECTIONS_KEY, JSON.stringify(persisted));
        }
        catch(e) {
        }
    }
}
