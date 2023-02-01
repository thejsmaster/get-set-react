var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
    }
    return ActionStore;
}());
export { ActionStore };
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
        var keys = __spreadArray([], Object.keys(obj.set), true); //.filter((key) => key.startsWith("set"));
        keys.forEach(function (key) {
            if (hasTimer(obj.set[key])) {
                console.error("timers not allowed inside set methods. move timers outside the state. get-set-react set methods don't support setTimeout or setInterval timers.");
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
                console.error("get-set-react does not support generator functions at this moment. ");
            }
            else if (typeof obj.set[key] === "function" &&
                obj.set[key].constructor.name === "AsyncFunction") {
                var retv_2;
                var orginalMethod_2 = obj.set[key];
                var temp_2 = function () {
                    var props = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        props[_i] = arguments[_i];
                    }
                    return __awaiter(this, void 0, void 0, function () {
                        var clear, e_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    clear = setInterval(function () {
                                        !obj.__.onSetInProgress && update(obj);
                                    }, 500);
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, 4, 5]);
                                    return [4 /*yield*/, orginalMethod_2.call.apply(orginalMethod_2, __spreadArray([obj], props, false))];
                                case 2:
                                    retv_2 = _a.sent();
                                    return [3 /*break*/, 5];
                                case 3:
                                    e_1 = _a.sent();
                                    catchError(e_1, key);
                                    return [3 /*break*/, 5];
                                case 4:
                                    if (clear) {
                                        if (!obj.__.onSetInProgress) {
                                            update(obj);
                                            obj.__.setList.push(temp_2);
                                        }
                                        clearInterval(clear);
                                    }
                                    return [7 /*endfinally*/];
                                case 5: return [2 /*return*/, retv_2];
                            }
                        });
                    });
                };
                obj.set[key] = temp_2;
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
export var setEffect = function (fn, deps) {
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
};
export var stateChanged = function (state, throttle, updateSiblings) {
    if (!state.__.clearTimeOut) {
        state.__.clearTimeOut = window.setTimeout(function () {
            if (state.onSet) {
                state.__.onSetInProgress = true;
                stateUpdateContext = state;
                try {
                    state.onSet();
                }
                catch (e) {
                    console.error("error in onSet", e);
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
};
function hasTimer(fn) {
    return (fn &&
        typeof fn === "function" &&
        (fn.toString().includes("setTimeout") ||
            fn.toString().includes("setInterval")));
}
