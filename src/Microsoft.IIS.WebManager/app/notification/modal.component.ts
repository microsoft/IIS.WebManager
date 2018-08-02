import { NgModule, Component, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { ModalArgs } from './modal';
import { NotificationService } from './notification.service';

@Component({
    selector: 'modal',
    template: `
        <div *ngIf="_display" class="modal">

          <div class="modal-content center">
            <span class="exit" title="Close" (click)="onCancel()">&times;</span>
            <h2 *ngIf="title" class="color-normal border-active">{{title}}</h2>
            <p class="message">{{message}}</p>
            <p>
                <button (click)="onConfirm()">OK</button>
                <button (click)="onCancel()">Cancel</button>
            </p>
          </div>

        </div>
    `,
    styles: [`
        .modal {
            display: block;
            position: fixed;
            z-index: 102;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgb(0,0,0);
            background-color: rgba(0,0,0,0.4);
        }

        .modal-content {
            background-color: #fefefe;
            padding: 10px;
            border: 1px solid #888;
            border-radius: 0;
            float: none;
        }

        .exit {
            color: #aaa;
            font-size: 22px;
            position: absolute;
            top: 0;
            right: 9px;
        }

        .exit:hover,
        .exit:focus {
            color: black;
            text-decoration: none;
            cursor: pointer;
        }

        .message {
            font-size: 115%;
            margin-bottom: 30px;
        }

        p {
            text-align: center;
        }
        
        button {
            width: 80px;
            font-size: 14px;
        }

        h2 {
            border-bottom-style: dotted;
            border-bottom-width: 1px;
            margin-top: 0px;
            margin-bottom: 20px;
            line-height: 34px;
        }

        h2:before {
            font-family: FontAwesome;
            content: "\\f29c";
            margin-right: 10px;
        }
    `]
})
export class ModalComponent implements OnDestroy {
    public message: string = "";
    public title: string = "";

    private _defaultTitle = "Confirm";
    private _display: boolean = false;
    private _onCancel: () => void = null;
    private _onConfirm: () => void = null;
    private _subscriptions: Array<Subscription> = [];

    constructor(private _svc: NotificationService) {
        _svc.modal.subscribe(args => {
            if (!args) {
                this.close();
                return;
            }

            this.title = args.title || this._defaultTitle;
            this.message = args.message;
            this._onConfirm = args.onConfirm;
            this._onCancel = args.onCancel;
            this.show();
        });
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(sub => sub.unsubscribe());
    }

    private show(): void {
        this._display = true;
    }

    private close(): void {
        this._display = false;
        this.reset();
    }

    private onConfirm() {
        if (this._onConfirm) {
            this._onConfirm();
        }
        this.close();
    }

    private onCancel() {
        if (this._onCancel) {
            this._onCancel();
        }
        this.close();
    }

    private reset() {
        this.message = "";
        this._onCancel = null;
        this._onConfirm = null;
    }
}