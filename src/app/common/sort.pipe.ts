import {NgModule, Pipe, PipeTransform} from "@angular/core";
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';


@Pipe({
    name: "orderby"
})
export class SortPipe implements PipeTransform {
    transform(arr: Array<any>, field: string, asc: boolean, comparer: (x, y, o1, o2) => number = null, inPlace: boolean = false): Array<any> {
        if (arr.length == 0 || !field) {
            return arr;
        }

        let fields = field.split('.');
        let stringSort: boolean = (typeof SortPipe.value(arr[0], fields) === 'string');

        if (!inPlace) {
            arr = arr.slice(); // Copy
        }

        arr.sort((l: any, r: any) => {
            let res: number;

            let x = SortPipe.value(l, fields);
            let y = SortPipe.value(r, fields);

            if (comparer) {
                res = comparer(x, y, l, r);
            }
            else {
                if (stringSort) {
                    res = (<string>x).localeCompare(y);
                }
                else {
                    x = x === undefined ? null : x;
                    y = y === undefined ? null : y;
                    res = <number>(x < y ? -1 : x > y);
                }
            }

            return asc ? res : -res;
        });
        
        return arr;
    }


    private static value(obj: any, fields: Array<string>): any {
        for (var i = 0; i < fields.length; ++i) {
            if (obj == null || obj === undefined) {
                obj = "";
                break;
            }

            obj = obj[fields[i]];
        }

        return obj;
    }
}

@NgModule({
    imports: [
        FormsModule,
        CommonModule
    ],
    exports: [
        SortPipe
    ],
    declarations: [
        SortPipe
    ]
})
export class Module { }




export class OrderBy {
    public _orderBy: string;
    private _orderByAsc: boolean;

    public get Field(): string {
        return this._orderBy;
    }

    public get Asc(): boolean {
        return this._orderByAsc;
    }

    public sort(field: string, allowNoSort: boolean = true) {
        if (field !== this._orderBy) {
            this._orderByAsc = true;
            this._orderBy = field;
        }
        else {
            if (!this._orderByAsc && allowNoSort) {
                this._orderBy = undefined;
                return;
            }

            this._orderByAsc = !this._orderByAsc;
        }
    }

    public sortAsc(field: string) {
        this._orderBy = field;
        this._orderByAsc = true;
    }

    public sortDesc(field: string) {
        this._orderBy = field;
        this._orderByAsc = false;
    }

    public css(field: string): any {
        if (this._orderBy === field) {
            return {
                "orderby": true,
                "desc": !this._orderByAsc
            };
        }

        return {};
    }

    public ariaSort(field: string): string {
        if (this._orderBy === field) {
            return this._orderByAsc ? 'ascending' : 'descending';
        }
        return 'none';
    }
}
