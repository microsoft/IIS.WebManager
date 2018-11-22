import { NgModule } from '@angular/core'
import { BootstrapModule } from './bootstrap.module'
import { StandardRuntime } from '../runtime/runtime'
import { AppComponent } from './app.component'
import { HttpModule } from '@angular/http';
import { HttpImpl } from 'common/http-impl';
import { WACModule } from 'runtime/wac/components/wac.module';

@NgModule({
    imports: [
        HttpModule,
        BootstrapModule,
        // If this is not included, angular would complain that WAC components are missing => even though they are not used
        WACModule,
    ],
    bootstrap: [ AppComponent ],
    providers: [
        { provide: "Http", useClass: HttpImpl },
        { provide: "Runtime", useClass: StandardRuntime },
    ]
})
export class AppModule {
}
