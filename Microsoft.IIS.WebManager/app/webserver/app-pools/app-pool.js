"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ApplicationPool = /** @class */ (function () {
    function ApplicationPool() {
    }
    return ApplicationPool;
}());
exports.ApplicationPool = ApplicationPool;
exports.PipelineMode = {
    Integrated: "integrated",
    Classic: "classic"
};
var Cpu = /** @class */ (function () {
    function Cpu() {
    }
    return Cpu;
}());
exports.Cpu = Cpu;
exports.ProcessorAction = {
    KillW3wp: "KillW3wp",
    NoAction: "NoAction",
    Throttle: "Throttle",
    ThrottleUnderLoad: "ThrottleUnderLoad"
};
var ProcessModel = /** @class */ (function () {
    function ProcessModel() {
    }
    return ProcessModel;
}());
exports.ProcessModel = ProcessModel;
var ApplicationPoolIdentity = /** @class */ (function () {
    function ApplicationPoolIdentity() {
    }
    return ApplicationPoolIdentity;
}());
exports.ApplicationPoolIdentity = ApplicationPoolIdentity;
var Recycling = /** @class */ (function () {
    function Recycling() {
    }
    return Recycling;
}());
exports.Recycling = Recycling;
var RapidFailProtection = /** @class */ (function () {
    function RapidFailProtection() {
    }
    return RapidFailProtection;
}());
exports.RapidFailProtection = RapidFailProtection;
var LoadBalancerCapabilities;
(function (LoadBalancerCapabilities) {
    LoadBalancerCapabilities[LoadBalancerCapabilities["TcpLevel"] = 1] = "TcpLevel";
    LoadBalancerCapabilities[LoadBalancerCapabilities["HttpLevel"] = 2] = "HttpLevel";
})(LoadBalancerCapabilities = exports.LoadBalancerCapabilities || (exports.LoadBalancerCapabilities = {}));
var ProcessOrphaning = /** @class */ (function () {
    function ProcessOrphaning() {
    }
    return ProcessOrphaning;
}());
exports.ProcessOrphaning = ProcessOrphaning;
exports.ProcessModelIdentityType = {
    LocalSystem: "LocalSystem",
    LocalService: "LocalService",
    NetworkService: "NetworkService",
    SpecificUser: "SpecificUser",
    ApplicationPoolIdentity: "ApplicationPoolIdentity"
};
var IdleTimeoutAction;
(function (IdleTimeoutAction) {
    IdleTimeoutAction[IdleTimeoutAction["Terminate"] = 0] = "Terminate";
    IdleTimeoutAction[IdleTimeoutAction["Suspend"] = 1] = "Suspend";
})(IdleTimeoutAction || (IdleTimeoutAction = {}));
//# sourceMappingURL=app-pool.js.map