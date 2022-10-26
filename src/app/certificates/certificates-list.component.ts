import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChildren, QueryList } from '@angular/core';
import { Subscription } from 'rxjs';
import { CertificateListItem } from './certificate-list-item';
import { Certificate } from './certificate';
import { Range } from '../common/virtual-list.component';
import { CertificatesService } from './certificates.service';
import { skip } from 'rxjs/operators';

@Component({
    selector: 'certificates-list',
    template: `
        <div class="toolbar">
            <div class="toolbar-right">
                <button title="Refresh" (click)="refresh()">
                    <i aria-hidden="true" class="sme-icon sme-icon-sync"></i>
                </button>
                <div *ngIf="_items" class="col-xs-8 col-sm-5 col-md-4 col-lg-3 actions filter hidden-xs">
                    <input placeholder="Search" type="search" aria-label="Filter" class="form-control" [class.border-active]="_filter" [(ngModel)]="_filter" (ngModelChange)="filter($event)" [throttle]="300" />
                </div>
            </div>
            <div class="clear"></div>
        </div>
        <div class="sme-icon sme-icon-folder">div</div>
        <i class="sme-icon sme-icon-folder">i</i>

        <div>
            <i class="dritest0"></i>
            <i class="dritest0">Dritest0</i>
            <i class="dritest02">Dritest02</i>
            <i class="dritest03">Dritest03</i>
            <i class="dritest04">Dritest04</i>

            <i class="dritest1">dritest1-i</i>

            <div>
                <i class="dritest1"><span>dritest1-i</span></i>
            </div>
            <div>
                <i class="sme-icon sme-icon-folder dritest2"><span>dritest2-i</span></i>
            </div>
            <div>
                <i class="sme-icon sme-icon-folder dritest3"><span>dritest3-i</span></i>
            </div>

            <i aria-hidden="true" class="sme-icon sme-icon-folder dritest3">On The i dritest3</i>

            <button title="Dri Test Button">
                <i aria-hidden="true" class="sme-icon sme-icon-folder dritest3"><span>On The Button dritest3</span></i>
            </button>
            <button title="Dri Test Button 2">
                <i aria-hidden="true" class="sme-icon sme-icon-folder sme-animation-spin-xxxl"></i>
            </button>

            <i aria-hidden="true" class="sme-icon sme-icon-globe sme-animation-spin-xs"></i>
            <i aria-hidden="true" class="sme-icon sme-icon-globe sme-spin-3s">Test 3s</i>
        </div>
        <div>
            <button title="Save (Ctrl+S)">
                <i aria-hidden="true" class="sme-icon sme-icon-save"></i>
            </button>
            <button title="Replace with Unmodified" class="undo color-active">
                <i aria-hidden="true" class="sme-icon sme-icon-down"></i>
            </button>
            <button title="Compare with Unmodified" class="compare" >
                <i aria-hidden="true" class="sme-icon sme-icon-storageMigration"></i>
            </button>
            <button title="Exit Compare Mode" class="uncompare active">
                <i aria-hidden="true" class="sme-icon sme-icon-storageMigration"></i>
            </button>
            <button title="Download">
                <i aria-hidden="true" class="sme-icon sme-icon-download"></i>
            </button>
        </div>
        <div *ngIf="_items" class="container-fluid">
            <div class="border-active grid-list-header row hidden-xs" [hidden]="_items.length == 0">
                <label class="col-xs-12 col-sm-6 col-md-4 col-lg-3">Name</label>
                <label class="col-xs-4 col-md-4 col-lg-3">Subject</label>
                <label class="col-xs-2 col-lg-2 hidden-xs hidden-sm">Issued By</label>
                <label class="col-lg-1 col-md-1 hidden-xs hidden-sm">Store</label>
                <label class="col-lg-2 hidden-xs hidden-sm hidden-md">Valid To</label>
            </div>
        </div>
        <virtual-list class="container-fluid grid-list"
                        *ngIf="_items"
                        [count]="_items.length"
                        [loaded]="loaded"
                        emptyText="No certificates found"
                        (rangeChange)="onRangeChange($event)">
            <li class="hover-editing"
                            *ngFor="let cert of _view; let i = index;"
                            (click)="selectCert(cert, $event)"
                            (dblclick)="onDblClick($event, i)">
                <certificate [model]="cert"></certificate>
            </li>
        </virtual-list>
    `,
    styles: [`
        .grid-item:hover {
            cursor: pointer;
        }

        li > div {
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .grid-item small {
            font-size: 11px;
            padding-left: 22px;
            font-weight: normal;
            display: block;
            line-height: 10px;
            margin-top: -5px;
        }

        .name {
            font-size: 16px;
        }

        .container-fluid,
        .row {
            margin: 0;
            padding: 0;
        }

        .dritest0 {
            font-size: 16px;
            font-family: "Server-MDL2";
            content: "\\e72e";
            font-style: normal;
            line-height: 20px;
            letter-spacing: 0px;
            font-variant: normal;
            font-weight: normal;
            text-rendering: auto;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        .dritest02 {
            font-family: "Server-MDL2";
            vertical-align: middle;
            font-size: 12px;
            line-height: 16px;
            padding: 3px;
            content: "\e768";
        }

        .dritest03:before {
            font-size: 16px;
            font-family: "Server-MDL2";
            content: "\\e72e";
            font-style: normal;
            line-height: 20px;
            letter-spacing: 0px;
            font-variant: normal;
            font-weight: normal;
            text-rendering: auto;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        .dritest04:before {
            font-size: 16px;
            font-family: "Server-MDL2";
            content: "\\e72e";
            font-style: normal;
            line-height: 20px;
            letter-spacing: 0px;
            font-variant: normal;
            font-weight: normal;
            text-rendering: auto;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
             -webkit-animation-name: sme-spin;
            animation-name: sme-spin;
            -webkit-animation-duration: 2s;
            animation-duration: 2s;
            -webkit-animation-timing-function: linear;
            animation-timing-function: linear;
            -webkit-animation-fill-mode: both;
            animation-fill-mode: both;
            -webkit-animation-iteration-count: infinite;
            animation-iteration-count: infinite
        }

        .dritest1:before {
            font-size: 16px;
            font-family: "Server-MDL2";
            content: "\\e774";
            -webkit-animation-name: sme-spin;
            animation-name: sme-spin;
            -webkit-animation-duration: 2s;
            animation-duration: 2s;
            -webkit-animation-timing-function: linear;
            animation-timing-function: linear;
            -webkit-animation-fill-mode: both;
            animation-fill-mode: both;
            -webkit-animation-iteration-count: infinite;
            animation-iteration-count: infinite
        }

        .dritest2:before {
            font-family: "Server-MDL2";
            font-size: 16px;
            -webkit-animation-name: sme-spin;
            animation-name: sme-spin;
            -webkit-animation-duration: 2s;
            animation-duration: 2s;
            -webkit-animation-timing-function: linear;
            animation-timing-function: linear;
            -webkit-animation-fill-mode: both;
            animation-fill-mode: both;
            -webkit-animation-iteration-count: infinite;
            animation-iteration-count: infinite
        }

        .dritest3:before {
            -webkit-animation-name: sme-spin;
            animation-name: sme-spin;
            -webkit-animation-duration: 2s;
            animation-duration: 2s;
            -webkit-animation-timing-function: linear;
            animation-timing-function: linear;
            -webkit-animation-fill-mode: both;
            animation-fill-mode: both;
            -webkit-animation-iteration-count: infinite;
            animation-iteration-count: infinite
        }

        .toolbar {
            margin-bottom: 20px;
        }

        .toolbar button span {
            font-size: 85%;
        }

        .toolbar button {
            border: none;
        }

        .toolbar > span {
            vertical-align: sub;
        }

        .toolbar-right {
            float: right;
        }

        .toolbar-right button {
            padding-right: 12px;
        }

        .filter {
            width: 300px;
            margin-right:12px;
        }
    `]
})
export class CertificatesListComponent implements OnInit, OnDestroy {
    @Output() public itemSelected: EventEmitter<any> = new EventEmitter();
    @Input() public lazy: boolean;
    private _filter = "";
    private certs: Array<Certificate>;
    private _view: Array<Certificate> = [];
    private _items: Array<Certificate> = [];
    private _range: Range = new Range(0, 0);
    private _subscriptions: Array<Subscription> = [];
    private loaded = false;
    @ViewChildren(CertificateListItem) private _listItems: QueryList<CertificateListItem>;

    constructor(private _service: CertificatesService) {
    }

    ngOnInit() {
        if (!this.lazy) {
            this.activate();
        }
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(s => s.unsubscribe());
    }

    activate() {
        this._service.certificates.pipe(
            skip(1),    // certs are implemented as BehaviorSubject which is not ideal. Skipping the initial value to workaround the dummy first value
        ).subscribe(certs => {
            this.loaded = true;
            this.certs = certs;
            this.filter(this._filter);
        });
        this.refresh();
    }

    selectCert(cert, evt: Event) {
        if (evt.defaultPrevented) {
            return;
        }

        this.itemSelected.emit(cert);
    }

    private onRangeChange(range: Range) {
        Range.fillView(this._view, this._items, range);
        this._range = range;
    }

    private filter(filter: string) {
        if (!filter) {
            this._items = this.certs;
            return;
        }

        filter = ("*" + this._filter + "*").replace("**", "*").replace("?", "");
        let rule = new RegExp("^" + filter.split("*").join(".*") + "$", "i");
        this._items = this.certs.filter(c => rule.test(Certificate.displayName(c)));

        this.onRangeChange(this._range);
    }

    private refresh() {
        this.loaded = false;
        this._service.load();
    }

    private onDblClick(e: Event, index: number) {
        if (e.defaultPrevented) {
            return;
        }

        this._listItems.forEach((c, i) => {
            if (i == index) {
                c.toggleView();
            }
        });
    }
}
