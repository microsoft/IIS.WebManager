declare var SETTINGS: any;

import {Component, OnDestroy} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/toPromise';

import {ApiConnection} from '../connect/api-connection'
import {HttpConnection} from '../connect/httpconnection'
import {ConnectService} from '../connect/connect.service';


@Component({
    template: `
        <div class="center">
            <div *ngIf='!_inProgress'>
                <h1>Hi there!</h1>
                <p>
                    Start managing your Microsoft IIS Server right here.
                    <br/>
                    <a href="https://blogs.iis.net/adminapi">Learn More</a>
                </p>
                <p>
                    <a class="bttn background-active" [attr.href]="DOWNLOAD_URL" (click)="download($event)">
                        Download Microsoft IIS Administration
                    </a>
                    <small class='block'>
                        Version {{SETUP_VERSION}}
                        <br/>
                        For Windows and Windows Server (64-bit)
                    </small>
                </p>
                <div clas="prereq block">
                    <div class="collapse-heading collapsed" data-toggle="collapse" data-target="#prereq">
                        <h2>Prerequisites</h2>
                    </div>
                    <div id="prereq" class="collapse">
                        <span>Internet Information Services (IIS)</span>&nbsp;|&nbsp;
                        <a href='https://www.iis.net/'><small>Learn More</small></a>
                        <br/>
                        <a title="Download .NET Core" href="https://go.microsoft.com/fwlink/?LinkID=827547">Microsoft .NET Core</a>&nbsp;|&nbsp;
                        <a href='https://www.microsoft.com/net/core/platform'><small>Learn More</small></a>
                    </div>
                </div>
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
    private DOWNLOAD_URL: string = SETTINGS.api_download_url;
    private SETUP_VERSION: string = SETTINGS.api_setup_version;
    private static STATUS_MSG: string[] = [
        'Checking on your progress',
        'Searching for Microsoft IIS Administration',
        'Just a moment',
        'It takes a bit longer',
        'Trying to establish connection'
    ];

    private _inProgress: boolean;
    private _pingTimeoutId: number;
    private _client: HttpConnection;
    private _status: string;

    constructor(private _http: Http,
                private _service: ConnectService) {

        this._client = new HttpConnection(_http);
    }

    ngOnDestroy() {
        this.skip();
    }

    private download(e: Event): boolean {
        this._inProgress = true;
        this._status = GetComponent.STATUS_MSG[0];
        this.ping();

        return true;
    }

    private skip() {
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
                        this._pingTimeoutId = setTimeout(() => this.ping(i + 1), 2000);
                    }
                }
            })
    }

    private finish() {
        clearTimeout(this._pingTimeoutId);

        this._inProgress = false;

        let conn = new ApiConnection("localhost");
        conn.displayName = "Local IIS";

        this._service.edit(conn);
    }
}