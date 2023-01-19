var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { useEffect, useState } from "react";
var ActionStore = /** @class */ (function () {
    function ActionStore() {
        this.subscriptions = [];
        this.clearTimeOut = null;
        this.version = 0;
        this.siblings = [];
    }
    return ActionStore;
}());
export default ActionStore;
function getSetJS(obj) {
    if (obj !== null &&
        obj !== undefined &&
        typeof obj === "object" &&
        !Array.isArray(obj)) {
        var keys = __spreadArray(__spreadArray([], Object.keys(obj.__proto__), true), Object.keys(obj), true).filter(function (key) { return key.startsWith("set"); });
        console.log(keys);
        keys.forEach(function (key) {
            if (typeof obj[key] === "function" &&
                obj[key].constructor.name === "Function") {
                var retv_1;
                var orginalMethod_1 = obj[key];
                var temp = function () {
                    var props = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        props[_i] = arguments[_i];
                    }
                    retv_1 = orginalMethod_1.call.apply(orginalMethod_1, __spreadArray([obj], props, false));
                    update(obj);
                    return retv_1;
                };
                obj[key] = temp;
            }
            else if (typeof obj[key] === "function" &&
                obj[key].constructor.name === "GeneratorFunction") {
                // TODO: need to implement for generator functions
            }
            else if (typeof obj[key] === "function" &&
                obj[key].constructor.name === "AsyncFunction") {
                console.error("async methods are not allowed for getSetJS state classes ", obj);
            }
        });
        obj.__ = new ActionStore();
    }
}
//c.set_increment();
//console.log(counter.async_fetchUsers.constructor.name);
// function stateChanged(obj) {
//   console.log("state changed for ", obj);
// }
export var subScribe = function (obj, func, label) {
    var subscription = obj.__.subscriptions.find(function (d) { return d.label === label; });
    if (!subscription) {
        obj.__.subscriptions.push({ label: label, action: func });
    }
};
export var update = function (obj, 
// method?: any,
throttle, updateSiblings) {
    //method && method.apply(obj, props);
    if (throttle === void 0) { throttle = 50; }
    if (updateSiblings === void 0) { updateSiblings = false; }
    (obj === null || obj === void 0 ? void 0 : obj.onChange) && obj.onChange();
    obj && stateChanged(obj, throttle, updateSiblings);
};
export var updateAll = function () { };
export var unSubscribe = function (obj, label) {
    obj.__.subscriptions = obj.__.subscriptions.filter(function (d) { return d.label !== label; });
};
export var stateChanged = function (state, throttle, updateSiblings) {
    if (!state.__.clearTimeOut) {
        state.__.clearTimeOut = window.setTimeout(function () {
            var subScriptions = [];
            if (!updateSiblings)
                subScriptions = state.__.subscriptions;
            else
                subScriptions = state.__.siblings.reduce(function (a, b) { return a.push(b.subscriptions); }, []);
            subScriptions.forEach(function (d) { return d.action && typeof d.action === "function" && d.action(); });
            state.__.clearTimeOut = null;
        }, throttle);
    }
};
export var getRandom = function (length) {
    var result = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};
var subscriptions = {};
function updateComponent(label, throttle) {
    if (throttle === void 0) { throttle = 50; }
    console.log(subscriptions);
    if (subscriptions[label] &&
        typeof subscriptions[label] == "object" &&
        subscriptions[label].action &&
        !subscriptions[label].clearTimeOut) {
        subscriptions[label].clearTimeOut = window.setTimeout(function () {
            var _a;
            ((_a = subscriptions[label]) === null || _a === void 0 ? void 0 : _a.action) && subscriptions[label].action();
        }, throttle);
    }
}
export var useSubscribe = function () {
    var props = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        props[_i] = arguments[_i];
    }
    var _a = useState(0), refresh = _a[0], setRefresh = _a[1];
    var uniqueCode = useState(getRandom(8))[0];
    props
        .filter(function (state) { return state && !state.__; })
        .forEach(function (state) {
        getSetJS(state);
    });
    useEffect(function () {
        subscriptions[uniqueCode] = {
            action: function () { return setRefresh(refresh + 1); },
            clearTimeOut: null,
        };
        __spreadArray([], props, true).forEach(function (item) {
            item && subScribe(item, function () { return updateComponent(uniqueCode); }, uniqueCode);
        });
        return function () {
            // clean up
            __spreadArray([], props, true).forEach(function (item) { return item && unSubscribe(item, uniqueCode); });
            subscriptions[uniqueCode] = null;
        };
    }, [refresh]);
};
