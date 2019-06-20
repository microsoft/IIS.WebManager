import { Component, OnDestroy, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiConnection } from '../connect/api-connection'
import { HttpConnection } from '../connect/httpconnection'
import { ConnectService } from '../connect/connect.service'
import { SETTINGS } from '../main/settings'
import { HttpFacade } from 'common/http-facade';

@Component({
    template: `
        <div class="center">
            <div *ngIf='!_inProgress'>
                <h1>Hi there!</h1>
                <p>
                    Start managing your Microsoft IIS Server right here.
                    <br/>
                    For more information, go to <a href="https://blogs.iis.net/adminapi">Microsoft IIS Administration API Home</a> page.
                </p>
                <p>
                    <a class="bttn background-active" [attr.href]="DOWNLOAD_URL" (click)="download($event)">
                        Download Microsoft IIS Administration API
                    </a>
                    <small class='block'>
                        Version {{SETUP_VERSION}}
                        <br/>
                        For Windows and Windows Server (64-bit)
                    </small>
                </p>
            </div>
            <div *ngIf='_inProgress'>
                <h1>Setting Up</h1>
                <p>
                    Please follow up the download and complete the installation.<br/><br/>
                    Then we'll continue from here automatically.
                </p>
                <p><i class="fa fa-spinner fa-pulse fa-3x"></i></p>
                <p><small class='block color-active'>{{_status}}</small></p>
            </div>
            <div class="skip">
                <button class="bordered" (click)="skip()">Skip this</button>
            </div>
        </div>
    `,
    styles: [`
        .center {
            text-align: center;
        }

        h1 {
            margin-bottom: 50px;
            font-size: 300%;
        }

        button {
            width: 100px;
        }

        p {
            padding-top: 20px;
            padding-bottom: 20px;
        }

        small {
            padding-top: 5px;
        }

        .bttn {
            padding-top: 8px;
            padding-bottom: 8px;
        }

        .bttn.background-active:focus {
            color: #FFFFFF
        }

        .collapse-heading {
            border: none;
        }

        h2 {
            font-size: 16px;
        }

        .skip {
            margin-top: 50px;
        }
    `]
})
export class GetComponent implements OnDestroy {
    private _inProgress: boolean;
    private DOWNLOAD_URL: string = SETTINGS.api_download_url;
    private SETUP_VERSION: string = SETTINGS.api_setup_version;
    private static STATUS_MSG: string[] = [
        'Checking on your progress',
        'Searching for Microsoft IIS Administration',
        'Just a moment',
        'It takes a bit longer',
        'Trying to establish connection'
    ];
    private _pingTimeout: NodeJS.Timer;
    private _client: HttpConnection;
    private _status: string;
    private _activeConnection: ApiConnection;
    private _subscriptions: Array<Subscription> = [];

    constructor(@Inject("Http") private _http: HttpFacade,
                private _service: ConnectService,
                private _router: Router) {

        this._client = new HttpConnection(_http);

        this._subscriptions.push(this._service.active.subscribe(connection => this._activeConnection = connection));
    }

    public ngOnDestroy(): void {
        this._subscriptions.forEach(sub => sub.unsubscribe());
    }

    private download(e: Event): void {
        if (this._activeConnection) {
            this._router.navigate(["/"]);
            return;
        }

        this._inProgress = true;
        this._status = GetComponent.STATUS_MSG[0];
        this.ping();
    }

    private skip() {
        if (this._activeConnection) {
            this._router.navigate(["/"]);
            return;
        }

        this._status = GetComponent.STATUS_MSG[0];
        this.finish();
    }

    private ping(i: number = 1) {
        if (i % 4 == 0) {
            var index = Math.floor(i / 4) - 1;
            this._status = GetComponent.STATUS_MSG[index % GetComponent.STATUS_MSG.length];
        }

        let conn = new ApiConnection("localhost");

        this._client.get(conn, "/api").toPromise()
            .catch(e => {
                if (e.status == 403) {
                    // The Access Token isn't specified, it's OK
                    this.finish();
                }
                else {
                    if (this._inProgress) {
                        this._pingTimeout = setTimeout(() => this.ping(i + 1), 2000);
                    }
                }
            })
    }

    private finish() {
        clearTimeout(this._pingTimeout);

        this._inProgress = false;

        let conn = new ApiConnection("");

        this._service.edit(conn);
    }
}
