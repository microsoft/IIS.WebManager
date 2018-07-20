import {Component, OnInit, Output, Input} from '@angular/core';
import {RouterLink, Router} from '@angular/router';
import {MODEL_DIRECTIVES} from '../../common/bmodel';
import {NotificationService} from '../../notification/notification.service';
import {DiffUtil} from '../../utils/diff';

import {ModuleService} from './modules.service';
import {Modules, LocalModule, GlobalModule} from './modules';
@Component({
    selector: 'modules',
    template: `
        <loading *ngIf="!(modules || _error)"></loading>
        <error [error]="_error"></error>        
        <div *ngIf="modules">
            <override-mode class="pull-right" [metadata]="modules.metadata" (revert)="onRevert()" (modelChanged)="onModelChanged()"></override-mode>
            <module-list [enabledNativeModules] = "enabledNativeModules"
                         [disabledNativeModules] = "disabledNativeModules"
                         [managedModules] = "managedModules"
                         [isServerSetting] = "isServerSetting"
                         (removeM) = "onRemoveManaged($event)"
                         (removeE) = "onRemoveNative($event, true)"
                         (removeD) = "onRemoveNative($event, false)"
                         (enable) = "onEnable($event)"
                         (disable) = "onDisable($event)"
                         (saveNative) = "onAddNativeModule($event)"
                         (saveManaged) = "onAddManagedModule($event)"
                         [locked]="_locked"></module-list>
        </div>
    `
})
export class ModulesComponent implements OnInit {

    id: string;
    modules: Modules;
    isServerSetting: boolean;

    private _original: Modules;
    private _error: any;
    private _locked: boolean;
    private activeModules: Array<LocalModule>;
    private globalModules: Array<GlobalModule>;

    enabledNativeModules: Array<GlobalModule>;
    disabledNativeModules: Array<GlobalModule>;
    managedModules: Array<LocalModule>;

    constructor(private _service: ModuleService,
        private _router: Router,
        private _notificationService: NotificationService) {
    }

    ngOnInit() {
        this.initialize();
    }    
    
    onModelChanged() {

        if (this.modules) {

            var changes = DiffUtil.diff(this._original, this.modules);

            if (Object.keys(changes).length > 0) {

                this._service.patchFeature(this.modules, changes)
                    .then(feature => {
                        this.modules = feature;
                        this._original = JSON.parse(JSON.stringify(feature));
                    });
            }
        }
    }

    onAddNativeModule(newModule) {
        newModule.modules = this.modules;
        this._service.addGlobalModule(newModule)
            .then(nativeModule1 => {
                this.globalModules.unshift(nativeModule1);
                this._service.addModule(this.modules, newModule)
                    .then(nativeModule2 => {
                        this.enabledNativeModules.unshift(nativeModule1);
                        this.activeModules.unshift(nativeModule2);
                    }).catch((e) => {
                        this.disabledNativeModules.unshift(nativeModule1);
                    });
            });
    }

    onAddManagedModule(newModule) {
        newModule.modules = this.modules;
        this._service.addModule(this.modules, newModule)
            .then(module => {
                this.activeModules.unshift(module);
                this.managedModules.unshift(module);
            });
    }

    onRemoveManaged(index: number) {
        for (var i = 0; i < this.activeModules.length; i++) {
            if (this.activeModules[i].id == this.managedModules[index].id) {
                this.activeModules.splice(i, 1);
                break;
            }
        }
        this._service.removeModule(this.managedModules[index]);
        this.managedModules.splice(index, 1);
    }

    onRemoveNative(index: number, isEnabled: boolean) {
        if (isEnabled) {
            var tempId = this.enabledNativeModules[index].id;
            var tempName = this.enabledNativeModules[index].name;
            this._service.removeModule(this.enabledNativeModules[index])
                .then(() => {
                    for (var i = 0; i < this.globalModules.length; i++) {
                        if (tempId == this.globalModules[i].id)
                            this.globalModules.splice(i, 1);
                    }
                });
            
            for (var i = 0; i < this.activeModules.length; i++) {
                if (this.activeModules[i].name == tempName) {
                    this.activeModules.splice(i, 1);               
                }
            }
            this.enabledNativeModules.splice(index, 1);  
        }
        else {
            var tempId = this.disabledNativeModules[index].id;
            this._service.removeModule(this.disabledNativeModules[index])
                .then(() => {
                    for (var i = 0; i < this.globalModules.length; i++) {
                        if (tempId == this.globalModules[i].id)
                            this.globalModules.splice(i, 1);
                    }
                });
            this.disabledNativeModules.splice(index, 1);  
        }
    }    

    onEnable(index: number) {
        var tempModule = JSON.parse(JSON.stringify(this.disabledNativeModules[index]));
        tempModule.modules = this.modules;
        this._service.addModule(this.modules, tempModule)
            .then(module => {
                this.activeModules.unshift(module);
            });
        this.enabledNativeModules.unshift(this.disabledNativeModules[index]);
        this.disabledNativeModules.splice(index, 1);
    }

    onDisable(index: number) {
        for (var i = 0; i < this.activeModules.length; i++) {
            if (this.activeModules[i].name == this.enabledNativeModules[index].name) {
                this._service.removeModule(this.activeModules[i]); // cannot call "removeModule" on "enabledNativeModules[index]", this will delete the global module
                this.activeModules.splice(i, 1);
                this.disabledNativeModules.unshift(this.enabledNativeModules[index]);
                this.enabledNativeModules.splice(index, 1);
                break;
            }            
        }       
    }

    onRevert() {
        this._service.revert(this.modules.id)
            .then(_ => {
                this.initialize();
            })
            .catch(e => {
                this._error = e;
            });
    }

    private initialize() {
        this._service.get(this.id)
            .then(s => {
                this.activeModules = s.modules;
                this.globalModules = s.globalModules;
                this.modules = s.feature;
                this.isServerSetting = (s.feature.scope == "");
                this._original = JSON.parse(JSON.stringify(s.feature));

                this.enabledNativeModules = [];
                this.disabledNativeModules = [];
                this.managedModules = [];

                for (var i in s.modules) {
                    if (s.modules[i].type)
                        this.managedModules.unshift(s.modules[i]);
                }

                for (var i in s.globalModules) {
                    var enabled = false;
                    for (var j in s.modules) {
                        if (s.modules[j].name == s.globalModules[i].name)
                            enabled = true;
                    }

                    if (!enabled)
                        this.disabledNativeModules.unshift(s.globalModules[i]);
                    else
                        this.enabledNativeModules.unshift(s.globalModules[i]);
                }

                this._locked = this.modules.metadata.is_locked;
            })
            .catch(e => {
                this._error = e;
            });
    }

}
