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
        this.onSetInProgress = false;
        this.setList = [];
        this.asyncClearInterval = null;
        this.asyncCount = 0;
        this.deps = [];
        this.onChangeCount = -1;
        this.onSetCalledCount = 0;
    }
    return ActionStore;
}());
export { ActionStore };
var timersFoundError = "timers not allowed inside set methods. move timers into other method that's name does not start with 'set'.";
var generatorsFound = "get-set-react does not support generator functions at this moment. ";
var asyncSetFound = "methods start with 'set' can not be async functions. ";
var catchError = function (e, key) {
    if (e === void 0) { e = ""; }
    if (key === void 0) { key = ""; }
    console.error("error occured in this function '" + key + " '. ", e);
    throw new Error("error occured in '" + key + "' function : check console: " + e);
    return;
};
var stateUpdateContext = null;
var snapchats = {};
export function copy(state) {
    return state && JSON.parse(JSON.stringify(state));
}
export function saveCopy(state, label) {
    state && label && (snapchats[label] = state);
}
export function getSavedCopy(label) {
    return snapchats[label];
}
function getSetJS(obj) {
    obj.__ = new ActionStore();
    if (obj !== null &&
        obj !== undefined &&
        typeof obj === "object" &&
        !Array.isArray(obj) &&
        obj.set !== null &&
        obj.set !== undefined &&
        typeof obj.set === "object" &&
        !Array.isArray(obj.set)) {
        var keys = __spreadArray([], Object.keys(obj.set), true);
        keys.forEach(function (key) {
            if (hasTimer(obj.set[key])) {
                console.error();
            }
            if (typeof obj.set[key] === "function" &&
                obj.set[key].constructor.name === "Function") {
                var retv_1 = undefined;
                var orginalMethod_1 = obj.set[key];
                var temp_1 = function () {
                    var props = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        props[_i] = arguments[_i];
                    }
                    try {
                        retv_1 = orginalMethod_1.call.apply(orginalMethod_1, __spreadArray([obj], props, false));
                        if (!obj.__.onSetInProgress) {
                            update(obj);
                            obj.__.setList.push(temp_1);
                        }
                    }
                    catch (e) {
                        catchError(e, key);
                    }
                    finally {
                        return retv_1;
                    }
                };
                obj.set[key] = temp_1;
            }
            else if (typeof obj.set[key] === "function" &&
                obj.set[key].constructor.name === "GeneratorFunction") {
                console.error(generatorsFound);
            }
            else if (typeof obj.set[key] === "function" &&
                obj.set[key].constructor.name === "AsyncFunction") {
                console.error(asyncSetFound);
            }
        });
    }
    else if (obj !== null &&
        obj !== undefined &&
        typeof obj === "object" &&
        !Array.isArray(obj) &&
        typeof obj.set !== "object") {
        var keys = __spreadArray(__spreadArray([], Object.keys(obj.__proto__), true), Object.keys(obj), true).filter(function (key) { return key.toLowerCase().startsWith("set"); });
        keys.forEach(function (key) {
            if (hasTimer(obj[key])) {
                console.error(timersFoundError);
            }
            if (typeof obj[key] === "function" &&
                obj[key].constructor.name === "Function") {
                var retv_2 = undefined;
                var orginalMethod_2 = obj[key];
                var temp_2 = function () {
                    var props = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        props[_i] = arguments[_i];
                    }
                    try {
                        retv_2 = orginalMethod_2.call.apply(orginalMethod_2, __spreadArray([obj], props, false));
                        if (!obj.__.onSetInProgress) {
                            update(obj);
                            obj.__.setList.push(temp_2);
                        }
                    }
                    catch (e) {
                        catchError(e, key);
                    }
                    finally {
                        return retv_2;
                    }
                };
                obj[key] = temp_2;
            }
            else if (typeof obj[key] === "function" &&
                obj[key].constructor.name === "GeneratorFunction") {
                console.error(generatorsFound);
            }
            else if (typeof obj[key] === "function" &&
                obj[key].constructor.name === "AsyncFunction") {
                console.error(asyncSetFound);
            }
        });
    }
}
export var subScribe = function (obj, func, label) {
    var subscription = obj.__.subscriptions.find(function (d) { return d.label === label; });
    if (!subscription) {
        obj.__.subscriptions.push({ label: label, action: func });
    }
};
var update = function (obj, throttle, updateSiblings) {
    if (throttle === void 0) { throttle = 50; }
    if (updateSiblings === void 0) { updateSiblings = false; }
    obj && stateChanged(obj, throttle, updateSiblings);
};
export var updateAll = function () { };
export var unSubscribe = function (obj, label) {
    obj.__.subscriptions = obj.__.subscriptions.filter(function (d) { return d.label !== label; });
};
export var setMemo = function (fn, deps) {
    // set methods;
    if (fn && typeof fn === "function") {
        if (fn.constructor.name === "AsyncFunction") {
            throw Error("async functions can not be passed to setEffect or setMemo.");
        }
        if (!stateUpdateContext ||
            !stateUpdateContext.__ ||
            !stateUpdateContext.__.setList) {
            console.error("something went wrong");
            return;
        }
        else {
            if (deps.length === 0 ||
                deps.find(function (dep) {
                    return Object.keys(stateUpdateContext.__.setList).find(function (key) { return stateUpdateContext.__.setList[key] === dep; });
                })) {
                fn && fn();
            }
        }
    }
};
export var onChange = function (fn, deps) {
    try {
        if (fn && typeof fn === "function") {
            if (fn.constructor.name === "AsyncFunction") {
                throw Error("async functions can not be passed to setEffect or setMemo.");
            }
            else if (!stateUpdateContext ||
                !stateUpdateContext.__ ||
                !stateUpdateContext.__.deps) {
                console.error("something went wrong in onSet/onChange");
                return;
            }
            else {
                stateUpdateContext.__.onChangeCount++;
                if (stateUpdateContext.__.onSetCalledCount === 0 ||
                    !deepEqual(deps, stateUpdateContext.__.deps[stateUpdateContext.__.onChangeCount])) {
                    // on set called before
                    try {
                        fn && fn();
                    }
                    catch (e) {
                        console.error("error occured inside the function passed to onchange.  ", fn.toString());
                    }
                    stateUpdateContext.__.deps[stateUpdateContext.__.onChangeCount] =
                        JSON.parse(JSON.stringify(deps));
                }
            }
        }
    }
    catch (e) {
        console.error("error occured in onChange");
    }
};
export var setEffect = onChange;
export var stateChanged = function (state, throttle, updateSiblings) {
    if (!state.__.clearTimeOut) {
        state.__.clearTimeOut = window.setTimeout(function () {
            if (state.onSet && typeof state.onSet === "function") {
                if (state.onSet.constructor.name === "AsyncFunction") {
                    throw Error("onSet functions can not be async.");
                }
                state.__.onSetInProgress = true;
                stateUpdateContext = state;
                try {
                    state.__.onChangeCount = -1;
                    state.onSet();
                    state.__.onSetCalledCount++;
                }
                catch (e) {
                    console.error("error occured in onSet", e);
                }
                finally {
                    state.__.setList = [];
                    state.__.onSetInProgress = false;
                    stateUpdateContext = null;
                }
            }
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
    if (subscriptions[label] &&
        typeof subscriptions[label] == "object" &&
        subscriptions[label].action &&
        !subscriptions[label].updateRequested) {
        subscriptions[label].updateRequested = true;
        window.setTimeout(function () {
            var _a;
            ((_a = subscriptions[label]) === null || _a === void 0 ? void 0 : _a.action) && subscriptions[label].action();
            subscriptions[label].updateRequested = false;
        }, throttle);
    }
}
export var useGetSet = function (props) {
    var _a = useState(0), refresh = _a[0], setRefresh = _a[1];
    var uniqueCode = useState(getRandom(8))[0];
    if (props.find(function (item) { return !item || typeof item !== "object" || Array.isArray(item); })) {
        console.error("one or more states passed to useGetSet is not a valid object. ", props);
        new TypeError("one or more states passed to useGetSet is not a valid object. ");
    }
    props
        .filter(function (state) { return state && !state.__; })
        .forEach(function (state) {
        getSetJS(state);
    });
    useEffect(function () {
        subscriptions[uniqueCode] = {
            action: function () { return setRefresh(refresh + 1); },
            updateRequested: false,
        };
        __spreadArray([], props, true).forEach(function (item) {
            item && subScribe(item, function () { return updateComponent(uniqueCode); }, uniqueCode);
        });
        return function () {
            // clean up
            __spreadArray([], props, true).forEach(function (item) { return item && unSubscribe(item, uniqueCode); });
            subscriptions[uniqueCode] = null;
        };
    }, [refresh, props, uniqueCode]);
    return [refresh];
};
function hasTimer(fn) {
    return (fn &&
        typeof fn === "function" &&
        (fn.toString().includes("setTimeout(") ||
            fn.toString().includes("setInterval(")));
}
function deepEqual(a, b) {
    if (a === b) {
        return true;
    }
    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) {
            return false;
        }
        for (var i = 0; i < a.length; i++) {
            if (!deepEqual(a[i], b[i])) {
                return false;
            }
        }
        return true;
    }
    if (typeof a !== "object" ||
        a === null ||
        typeof b !== "object" ||
        b === null) {
        return false;
    }
    var keysA = Object.keys(a);
    var keysB = Object.keys(b);
    if (keysA.length !== keysB.length) {
        return false;
    }
    for (var _i = 0, keysA_1 = keysA; _i < keysA_1.length; _i++) {
        var key = keysA_1[_i];
        if (!keysB.includes(key) || !deepEqual(a[key], b[key])) {
            return false;
        }
    }
    return true;
}
