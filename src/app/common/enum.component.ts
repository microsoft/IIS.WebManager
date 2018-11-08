import { NgModule, Component, Input, Output, EventEmitter, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'enum',
    template: `
        <ul [attr.disabled]="disabled ? true : null">
        <li tabindex="0" *ngFor="let field of fields" [class.background-active]="'' + model == field.value" [attr.title]="field.title || null" [hidden]="field.hidden" (keyup.enter)="select(field)" (click)="select(field)">
                {{field.name}}
            </li>
        </ul>
    `,
    styles: [`
        ul {
            padding: 0;
            margin: 0;
        }

        li {
            float: left;
            cursor: pointer;
            padding: 7px;
            margin-right: 5px;
            text-align: center;
            min-width: 45px;
        }

        li:last-of-type {
            margin-right: 0;
        }

        li:focus {
            /* Accessibility */
            outline-style: dashed;
            outline-color: #000;
            outline-width: 2px;
            outline-offset: -2px;
            text-decoration: underline;
        }
    `]
})
export class EnumComponent {
    fields: FieldComponent[] = [];

    @Input('model') model: any;
    @Input('disabled') disabled: boolean;

    @Output('modelChange') modelChange: any = new EventEmitter();
    @Output('modelChanged') modelChanged: any = new EventEmitter();


    add(field: FieldComponent) {
        this.fields.push(field);
    }

    select(field: FieldComponent) {
        this.model = field.value;

        this.modelChange.emit(this.model);
        this.modelChanged.emit();
    }
}


@Component({
    selector: 'field',
    template: `
    <div>
        <ng-content></ng-content>
    </div>
`
})
export class FieldComponent {
    @Input() public name: string;
    @Input() public value: string;
    @Input() public hidden: boolean = false;
    @Input() public title: string;

    constructor(parent: EnumComponent) {
        parent.add(this);
    }
}


export const ENUM: any[] = [
    EnumComponent,
    FieldComponent
];

@NgModule({
    imports: [
        FormsModule,
        CommonModule
    ],
    exports: [
        ENUM
    ],
    declarations: [
        ENUM
    ]
})
export class Module { }
