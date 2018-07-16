"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var notification_service_1 = require("./notification.service");
var ModalComponent = /** @class */ (function () {
    function ModalComponent(_svc) {
        var _this = this;
        this._svc = _svc;
        this.message = "";
        this.title = "";
        this._defaultTitle = "Confirm";
        this._display = false;
        this._onCancel = null;
        this._onConfirm = null;
        this._subscriptions = [];
        _svc.modal.subscribe(function (args) {
            if (!args) {
                _this.close();
                return;
            }
            _this.title = args.title || _this._defaultTitle;
            _this.message = args.message;
            _this._onConfirm = args.onConfirm;
            _this._onCancel = args.onCancel;
            _this.show();
        });
    }
    ModalComponent.prototype.ngOnDestroy = function () {
        this._subscriptions.forEach(function (sub) { return sub.unsubscribe(); });
    };
    ModalComponent.prototype.show = function () {
        this._display = true;
    };
    ModalComponent.prototype.close = function () {
        this._display = false;
        this.reset();
    };
    ModalComponent.prototype.onConfirm = function () {
        if (this._onConfirm) {
            this._onConfirm();
        }
        this.close();
    };
    ModalComponent.prototype.onCancel = function () {
        if (this._onCancel) {
            this._onCancel();
        }
        this.close();
    };
    ModalComponent.prototype.reset = function () {
        this.message = "";
        this._onCancel = null;
        this._onConfirm = null;
    };
    ModalComponent = __decorate([
        core_1.Component({
            selector: 'modal',
            template: "\n        <div *ngIf=\"_display\" class=\"modal\">\n\n          <div class=\"modal-content center\">\n            <span class=\"exit\" title=\"Close\" (click)=\"onCancel()\">&times;</span>\n            <h2 *ngIf=\"title\" class=\"color-normal border-active\">{{title}}</h2>\n            <p class=\"message\">{{message}}</p>\n            <p>\n                <button (click)=\"onConfirm()\">OK</button>\n                <button (click)=\"onCancel()\">Cancel</button>\n            </p>\n          </div>\n\n        </div>\n    ",
            styles: ["\n        .modal {\n            display: block;\n            position: fixed;\n            z-index: 102;\n            left: 0;\n            top: 0;\n            width: 100%;\n            height: 100%;\n            overflow: auto;\n            background-color: rgb(0,0,0);\n            background-color: rgba(0,0,0,0.4);\n        }\n\n        .modal-content {\n            background-color: #fefefe;\n            padding: 10px;\n            border: 1px solid #888;\n            border-radius: 0;\n            float: none;\n        }\n\n        .exit {\n            color: #aaa;\n            font-size: 22px;\n            position: absolute;\n            top: 0;\n            right: 9px;\n        }\n\n        .exit:hover,\n        .exit:focus {\n            color: black;\n            text-decoration: none;\n            cursor: pointer;\n        }\n\n        .message {\n            font-size: 115%;\n            margin-bottom: 30px;\n        }\n\n        p {\n            text-align: center;\n        }\n        \n        button {\n            width: 80px;\n            font-size: 14px;\n        }\n\n        h2 {\n            border-bottom-style: dotted;\n            border-bottom-width: 1px;\n            margin-top: 0px;\n            margin-bottom: 20px;\n            line-height: 34px;\n        }\n\n        h2:before {\n            font-family: FontAwesome;\n            content: \"\\f29c\";\n            margin-right: 10px;\n        }\n    "]
        }),
        __metadata("design:paramtypes", [notification_service_1.NotificationService])
    ], ModalComponent);
    return ModalComponent;
}());
exports.ModalComponent = ModalComponent;
//# sourceMappingURL=modal.component.js.map