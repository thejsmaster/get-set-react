import { useEffect, useState } from "react";
export class ActionStore {
  subscriptions = [];
  clearTimeOut = null;
  version = 0;
  siblings = [];
  onSetInProgress = false;
  setList = [];
  asyncClearInterval = null;
  asyncCount = 0;
  deps = [];
  onChangeCount = -1;
  onSetCalledCount = 0;
}
const timersFoundError =
  "timers not allowed inside set methods. move timers into other method that's name does not start with 'set'.";
const generatorsFound =
  "get-set-react does not support generator functions at this moment. ";
const asyncSetFound = "methods start with 'set' can not be async functions. ";
const catchError = (e: any = "", key = "") => {
  console.error("error occured in this function '" + key + " '. ", e);
  throw new Error(
    "error occured in '" + key + "' function : check console: " + e
  );
  return;
};
let stateUpdateContext: any = null;
const snapchats: any = {};
export function copy(state: any) {
  return state && JSON.parse(JSON.stringify(state));
}
export function saveCopy(state: any, label: string) {
  state && label && (snapchats[label] = state);
}
export function getSavedCopy(label: string) {
  return snapchats[label];
}

function getSetJS<T>(obj: T | any) {
  obj.__ = new ActionStore();
  if (
    obj !== null &&
    obj !== undefined &&
    typeof obj === "object" &&
    !Array.isArray(obj) &&
    obj.set !== null &&
    obj.set !== undefined &&
    typeof obj.set === "object" &&
    !Array.isArray(obj.set)
  ) {
    let keys = [...Object.keys(obj.set as object)];

    keys.forEach((key) => {
      if (hasTimer(obj.set[key])) {
        console.error();
      }
      if (
        typeof obj.set[key] === "function" &&
        obj.set[key].constructor.name === "Function"
      ) {
        let retv: any = undefined;
        let orginalMethod = obj.set[key];
        let temp = function (...props: any) {
          try {
            retv = orginalMethod.call(obj, ...props);
            if (!obj.__.onSetInProgress) {
              update(obj);
              obj.__.setList.push(temp);
            }
          } catch (e: any) {
            catchError(e, key);
          } finally {
            return retv;
          }
        };
        obj.set[key] = temp;
      } else if (
        typeof obj.set[key] === "function" &&
        obj.set[key].constructor.name === "GeneratorFunction"
      ) {
        console.error(generatorsFound);
      } else if (
        typeof obj.set[key] === "function" &&
        obj.set[key].constructor.name === "AsyncFunction"
      ) {
        console.error(asyncSetFound);
      }
    });
  } else if (
    obj !== null &&
    obj !== undefined &&
    typeof obj === "object" &&
    !Array.isArray(obj) &&
    typeof obj.set !== "object"
  ) {
    let keys = [
      ...Object.keys(obj.__proto__),
      ...Object.keys(obj as object),
    ].filter((key) => key.toLowerCase().startsWith("set"));

    keys.forEach((key) => {
      if (hasTimer(obj[key])) {
        console.error(timersFoundError);
      }
      if (
        typeof obj[key] === "function" &&
        obj[key].constructor.name === "Function"
      ) {
        let retv: any = undefined;
        let orginalMethod = obj[key];
        let temp = function (...props: any) {
          try {
            retv = orginalMethod.call(obj, ...props);
            if (!obj.__.onSetInProgress) {
              update(obj);
              obj.__.setList.push(temp);
            }
          } catch (e: any) {
            catchError(e, key);
          } finally {
            return retv;
          }
        };
        obj[key] = temp;
      } else if (
        typeof obj[key] === "function" &&
        obj[key].constructor.name === "GeneratorFunction"
      ) {
        console.error(generatorsFound);
      } else if (
        typeof obj[key] === "function" &&
        obj[key].constructor.name === "AsyncFunction"
      ) {
        console.error(asyncSetFound);
      }
    });
  }
}

export let subScribe = function (obj: any, func: any, label: any) {
  let subscription = obj.__.subscriptions.find((d: any) => d.label === label);
  if (!subscription) {
    obj.__.subscriptions.push({ label: label, action: func });
  }
};
let update = function (obj: any, throttle = 50, updateSiblings = false) {
  obj && stateChanged(obj, throttle, updateSiblings);
};
export let updateAll = () => {};
export let unSubscribe = function (obj: any, label: any) {
  obj.__.subscriptions = obj.__.subscriptions.filter(
    (d: any) => d.label !== label
  );
};

export const setMemo = (fn: Function, deps: Function[]) => {
  // set methods;
  if (fn && typeof fn === "function") {
    if (fn.constructor.name === "AsyncFunction") {
      throw Error("async functions can not be passed to setEffect or setMemo.");
    }
    if (
      !stateUpdateContext ||
      !stateUpdateContext.__ ||
      !stateUpdateContext.__.setList
    ) {
      console.error("something went wrong");
      return;
    } else {
      if (
        deps.length === 0 ||
        deps.find((dep) =>
          Object.keys(stateUpdateContext.__.setList).find(
            (key) => stateUpdateContext.__.setList[key] === dep
          )
        )
      ) {
        fn && fn();
      }
    }
  }
};

export const onChange = (fn: Function, deps: any) => {
  try {
    if (fn && typeof fn === "function") {
      if (fn.constructor.name === "AsyncFunction") {
        throw Error(
          "async functions can not be passed to setEffect or setMemo."
        );
      } else if (
        !stateUpdateContext ||
        !stateUpdateContext.__ ||
        !stateUpdateContext.__.deps
      ) {
        console.error("something went wrong in onSet/onChange");
        return;
      } else {
        stateUpdateContext.__.onChangeCount++;
        if (
          stateUpdateContext.__.onSetCalledCount === 0 ||
          !deepEqual(
            deps,
            stateUpdateContext.__.deps[stateUpdateContext.__.onChangeCount]
          )
        ) {
          // on set called before

          try {
            fn && fn();
          } catch (e) {
            console.error(
              "error occured inside the function passed to onchange.  ",
              fn.toString()
            );
          }
          stateUpdateContext.__.deps[stateUpdateContext.__.onChangeCount] =
            JSON.parse(JSON.stringify(deps));
        }
      }
    }
  } catch (e) {
    console.error("error occured in onChange");
  }
};

export const setEffect = onChange;
export let stateChanged = function (
  state: any,
  throttle: number,
  updateSiblings: any
) {
  if (!state.__.clearTimeOut) {
    state.__.clearTimeOut = window.setTimeout(() => {
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
        } catch (e) {
          console.error("error occured in onSet", e);
        } finally {
          state.__.setList = [];
          state.__.onSetInProgress = false;
          stateUpdateContext = null;
        }
      }
      let subScriptions = [];
      if (!updateSiblings) subScriptions = state.__.subscriptions;
      else
        subScriptions = state.__.siblings.reduce(
          (a: any, b: any) => a.push(b.subscriptions),
          []
        );
      subScriptions.forEach(
        (d: any) => d.action && typeof d.action === "function" && d.action()
      );
      state.__.clearTimeOut = null;
    }, throttle);
  }
};
export const getRandom = (length: number) => {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
const subscriptions: any = {};
function updateComponent(label: string, throttle: number = 50) {
  if (
    subscriptions[label] &&
    typeof subscriptions[label] == "object" &&
    subscriptions[label].action &&
    !subscriptions[label].updateRequested
  ) {
    subscriptions[label].updateRequested = true;
    window.setTimeout(() => {
      subscriptions[label]?.action && subscriptions[label].action();
      subscriptions[label].updateRequested = false;
    }, throttle);
  }
}

export const useGetSet = function (props: any[]) {
  const [refresh, setRefresh] = useState(0);
  const [uniqueCode] = useState(getRandom(8));
  if (
    props.find(
      (item) => !item || typeof item !== "object" || Array.isArray(item)
    )
  ) {
    console.error(
      "one or more states passed to useGetSet is not a valid object. ",
      props
    );
    new TypeError(
      "one or more states passed to useGetSet is not a valid object. "
    );
  }
  props
    .filter((state: any) => state && !state.__)
    .forEach((state: any) => {
      getSetJS(state);
    });
  useEffect(() => {
    subscriptions[uniqueCode] = {
      action: () => setRefresh(refresh + 1),
      updateRequested: false,
    };
    [...props].forEach((item) => {
      item && subScribe(item, () => updateComponent(uniqueCode), uniqueCode);
    });
    return function () {
      // clean up
      [...props].forEach((item) => item && unSubscribe(item, uniqueCode));
      subscriptions[uniqueCode] = null;
    };
  }, [refresh, props, uniqueCode]);
  return [refresh];
};

function hasTimer(fn: Function) {
  return (
    fn &&
    typeof fn === "function" &&
    (fn.toString().includes("setTimeout(") ||
      fn.toString().includes("setInterval("))
  );
}

function deepEqual(a: any, b: any) {
  if (a === b) {
    return true;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }

    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) {
        return false;
      }
    }

    return true;
  }

  if (
    typeof a !== "object" ||
    a === null ||
    typeof b !== "object" ||
    b === null
  ) {
    return false;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (const key of keysA) {
    if (!keysB.includes(key) || !deepEqual(a[key], b[key])) {
      return false;
    }
  }

  return true;
}
