import {NgModule, Pipe, PipeTransform} from "@angular/core";
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';


@Pipe({
    name: "filter"
})
export class FilterPipe implements PipeTransform {
    transform(arr: Array<any>, field: string, value: any, cb: (val, item) => boolean = null): Array<any> {
        if (arr.length == 0 || !field) {
            return arr;
        }

        let fields = field.split('.');
        let stringFilter: boolean = (typeof FilterPipe.value(arr[0], fields) === 'string');

        return arr.filter(i => {
            let x = FilterPipe.value(i, fields);

            if (cb) {
                return cb(x, i);
            }
            else {
                if (stringFilter) {
                    return (<string>x).indexOf(value) >= 0;
                }
                else {
                    return x == value;
                }
            }
        });
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
        FilterPipe
    ],
    declarations: [
        FilterPipe
    ]
})
export class Module { }