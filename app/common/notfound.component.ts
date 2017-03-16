
import {NgModule, Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';


@Component({
    selector: 'not-found',
    template: `
        <h1>Nothing here :(</h1>
        <span>But, hey, even the Universe can appear from nothing.</span>
    `
})
export class NotFound {
}

@NgModule({
    imports: [
        FormsModule,
        CommonModule
    ],
    exports: [
        NotFound
    ],
    declarations: [
        NotFound
    ]
})
export class Module { }
