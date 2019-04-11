
import {NgModule, Directive, Input, ReflectiveInjector, ViewContainerRef, NgModuleRef, ComponentRef, Compiler, OnInit, Injector} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ComponentLoader} from './component-loader';
import { ComponentReference } from 'main/settings';

@Directive({
    selector: 'dynamic',
})
export class DynamicComponent implements OnInit {
    @Input() name: string;
    //
    // Angular2 module loading syntax
    // '<modulePath>#<moduleName>'
    @Input() module: ComponentReference;
    @Input() selector: string;
    @Input() data: any;
    @Input() loader: any;
    @Input() eager: boolean;

    private _moduleRef: NgModuleRef<any>;
    private _componentRef: ComponentRef<any>;

    constructor(private vcRef: ViewContainerRef, private compiler: Compiler) {
    }

    ngOnInit() {
        if (this.eager) {
            this.activate();
        }
    }

    public activate() {
        if (!this.name) {
            return;
        }
        
        if (this._componentRef) {
            if (typeof (this._componentRef.instance["activate"]) === "function") {
                this._componentRef.instance.activate();
            }
            return;
        }

        let data = this.data;

        this.initializeComponent()
            .then(() => {
                this.bind(data);
            });
    }

    public deactivate() {
        if (this._componentRef) {
            if (typeof (this._componentRef.instance["deactivate"]) === "function") {
                this._componentRef.instance.deactivate();
            }
        }
    }

    public rebind(data: any) {
        this.deactivate();
        this.bind(data);
        this.activate();
    }

    destroy() {
        if (this._componentRef) {
            this._componentRef.destroy();
        }
        this._componentRef = null;

        if (this._moduleRef) {
            this._moduleRef.destroy();
        }
        this._moduleRef = null;
    }

    private initializeComponent(): Promise<any> {
        if (this._componentRef) {
            return Promise.resolve();
        }

        let vRef = this.vcRef;
        return ComponentLoader.LoadAsync(this.compiler, this.module)
            .then(moduleWithComponentFactories => {

                let targetFactory = moduleWithComponentFactories.componentFactories.find(x => {
                    return x.componentType.name == this.name;
                });

                let injector: Injector = ReflectiveInjector.fromResolvedProviders([], vRef.parentInjector);

                // AppModule is the main module, it is never loaded dynamically and it imports the browser module which can only be imported once
                if (moduleWithComponentFactories.ngModuleFactory.moduleType.name != "AppModule") {
                    this._moduleRef = moduleWithComponentFactories.ngModuleFactory.create(injector);
                    injector = this._moduleRef.injector;
                }

                this._componentRef = this.vcRef.createComponent(targetFactory, 0, injector, []);
            });
    }

    private bind(data: any) {
        if (data && this._componentRef) {
            this.data = data;
            var keys = Object.keys(data);
            for (var key of keys) {
                this._componentRef.instance[key] = data[key];
            }
        }
    }
}

export class DynamicComponentArgs {
    componentName: string;
    module: string;
    data: any;
}

@NgModule({
    imports: [
        FormsModule,
        CommonModule
    ],
    exports: [
        DynamicComponent
    ],
    declarations: [
        DynamicComponent
    ]
})
export class Module { }
