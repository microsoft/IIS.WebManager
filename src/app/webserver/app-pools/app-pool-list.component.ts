import {Component, OnInit, OnDestroy, Input, Output, EventEmitter, Inject} from '@angular/core';
import {Subscription} from 'rxjs';
import {AppPoolsService} from './app-pools.service';
import {ApplicationPool} from './app-pool';

@Component({
    selector: 'app-pools',
    template: `
        <loading *ngIf="!_appPools && !lazy"></loading>
        <app-pool-list
            *ngIf="_appPools"
            [model]="_appPools"
            [listingOnly]="listingOnly"
            (itemSelected)="onItemSelected($event)"></app-pool-list>
    `,
    styles: [`
        br {
            margin-top: 30px;
        }
    `]
})
export class AppPoolListComponent implements OnInit, OnDestroy {
    @Input() listingOnly: boolean = false;
    @Input() lazy: boolean = false;
    @Output() itemSelected: EventEmitter<any> = new EventEmitter();

    private _appPools: Array<ApplicationPool>;
    private _subs: Array<Subscription> = [];

    constructor(
        @Inject("AppPoolsService") private _service: AppPoolsService,
    ) {}

    ngOnInit() {
        if (!this.lazy) {
            this.activate();
        }
    }

    ngOnDestroy() {
        this._subs.forEach(s => s.unsubscribe());
    }

    activate() {
        this.lazy = false;

        if (this._appPools) {
            return;
        }

        this._service.getAll().then(_ => {
            this._subs.push(this._service.appPools.subscribe(pools => {
                this._appPools = [];
                pools.forEach(p => this._appPools.push(p));
            }));
        });
    }

    onItemSelected(pool: ApplicationPool) {
        if (this.itemSelected.observers.length > 0) {
            this.itemSelected.emit(pool);
        }
    }
}
