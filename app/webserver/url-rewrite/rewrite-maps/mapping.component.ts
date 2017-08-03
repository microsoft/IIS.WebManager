import { Component, Input, Output, EventEmitter, OnChanges, SimpleChange } from '@angular/core';

import { UrlRewriteService } from '../service/url-rewrite.service';
import { RewriteMap, RewriteMapping } from '../url-rewrite';

@Component({
    selector: 'rewrite-mapping',
    template: `
        <div *ngIf="mapping && !_editing" class="grid-item row" [class.background-selected]="_editing" (dblclick)="edit()">
            <div class="col-xs-6 col-sm-4 valign">
                {{mapping.name}}
            </div>
            <div class="col-xs-6 col-sm-4 valign">
                {{mapping.value}}
            </div>
            <div class="actions">
                <div class="action-selector">
                    <button title="More" (click)="selector.toggle()" (dblclick)="$event.preventDefault()" [class.background-active]="(selector && selector.opened) || false">
                        <i class="fa fa-ellipsis-h"></i>
                    </button>
                    <selector #selector [right]="true">
                        <ul>
                            <li><button #menuButton class="edit" title="Edit" (click)="edit()">Edit</button></li>
                            <li><button #menuButton class="delete" title="Delete" (click)="delete()">Delete</button></li>
                        </ul>
                    </selector>
                </div>
            </div>
        </div>
        <rewrite-mapping-edit
            *ngIf="_editing"
            [mapping]="mapping"
            (save)="onSave()"
            (cancel)="onCancel()"></rewrite-mapping-edit>
    `
})
export class MappingComponent implements OnChanges {
    @Input() public mapping: RewriteMapping;
    @Output('delete') public deleteEvent: EventEmitter<any> = new EventEmitter<any>();

    private _editing: boolean;
    private _original: RewriteMapping;

    ngOnChanges(changes: { [key: string]: SimpleChange; }): any {
        if (changes["mapping"]) {
            this._original = JSON.parse(JSON.stringify(changes["mapping"].currentValue));
        }
    }

    private edit() {
        this._editing = true;
    }

    private onSave() {
        this._editing = false;
        this._original = JSON.parse(JSON.stringify(this.mapping))
    }

    private onCancel() {
        this._editing = false;
        this.mapping = JSON.parse(JSON.stringify(this._original));
    }

    private delete() {
        this.deleteEvent.next();
    }
}


@Component({
    selector: 'rewrite-mapping-edit',
    template: `
        <div *ngIf="mapping" class="grid-item row background-editing">
            <div class="actions">
                <button class="no-border ok" [disabled]="!isValid()" title="Ok" (click)="onOk()"></button>
                <button class="no-border cancel" title="Cancel" (click)="onDiscard()"></button>
            </div>
            <fieldset>
                <label>Name</label>
                <input type="text" required class="form-control name" [(ngModel)]="mapping.name" />
            </fieldset>
            <fieldset>
                <label>Value</label>
                <input type="text" required class="form-control name" [(ngModel)]="mapping.value" />
            </fieldset>
        </div>
    `,
    styles: [`
        fieldset {
            padding-left: 15px;
            padding-right: 15px;
        }
    `]
})
export class MappingEditComponent {
    @Input() public mapping: RewriteMapping;

    @Output() cancel: EventEmitter<any> = new EventEmitter<any>();
    @Output() save: EventEmitter<any> = new EventEmitter<any>();

    private isValid(): boolean {
        return !!this.mapping.name && !!this.mapping.value;
    }

    private onDiscard() {
        this.cancel.emit();
    }

    private onOk() {
        this.save.emit(this.mapping);
    }
}