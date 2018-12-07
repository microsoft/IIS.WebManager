import {Component, OnInit, OnDestroy, Input, Output, EventEmitter, Inject} from '@angular/core';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';

import {AppPoolsService} from './app-pools.service';
import {ApplicationPool} from './app-pool';
import {AppPoolList} from './app-pool-list';


@Component({
    selector: 'app-pools',
    template: `
        <loading *ngIf="!_appPools && !lazy"></loading>
        <div>
            <button [class.background-active]="newAppPool.opened" (click)="newAppPool.toggle()">Create Application Pool <i class="fa fa-caret-down"></i></button>
            <selector #newAppPool class="container-fluid">
                <new-app-pool *ngIf="newAppPool.opened" (created)="newAppPool.close()" (cancel)="newAppPool.close()"></new-app-pool>
            </selector>
        </div>
        <br/>
        <app-pool-list *ngIf="_appPools" [model]="_appPools" (itemSelected)="onItemClicked($event)"></app-pool-list>
    `,
    styles: [`
        br {
            margin-top: 30px;
        }
    `]
})
export class AppPoolListComponent implements OnInit, OnDestroy {
    @Input() actions: string = "recycle,start,stop,delete";
    @Input() lazy: boolean = false;
    @Output() itemSelected: EventEmitter<any> = new EventEmitter();

    private _appPools: Array<ApplicationPool>;
    private _subs: Array<Subscription> = [];

    constructor(@Inject("AppPoolsService") private _service: AppPoolsService,
                private _router: Router) {
    }

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

    private onItemClicked(pool: ApplicationPool) {
        if (this.itemSelected.observers.length > 0) {
            this.itemSelected.emit(pool);
        }
    }
}
