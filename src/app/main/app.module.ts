import { NgModule } from '@angular/core'
import { BootstrapModule } from './bootstrap.module'
import { StandardRuntime } from '../runtime/runtime'
import { AppComponent } from './app.component'
import { HttpModule } from '@angular/http';
import { HttpImpl } from 'common/http-impl';

@NgModule({
    imports: [
        HttpModule,
        BootstrapModule,
    ],
    bootstrap: [ AppComponent ],
    providers: [
        { provide: "Http", useClass: HttpImpl },
        { provide: "Runtime", useClass: StandardRuntime },
    ]
})
export class AppModule {
}
