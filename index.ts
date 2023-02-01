import { useEffect, useState } from "react";
export class ActionStore {
  subscriptions = [];
  clearTimeOut = null;
  version = 0;
  siblings = [];
  onSetInProgress = false;
  setList = [];
}
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
    let keys = [
      //...Object.keys(obj.__proto__),
      ...Object.keys(obj.set as object),
    ]; //.filter((key) => key.startsWith("set"));

    keys.forEach((key) => {
      if (hasTimer(obj.set[key])) {
        console.error(
          "timers not allowed inside set methods. move timers outside the state. get-set-react set methods don't support setTimeout or setInterval timers."
        );
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
        console.error(
          "get-set-react does not support generator functions at this moment. "
        );
      } else if (
        typeof obj.set[key] === "function" &&
        obj.set[key].constructor.name === "AsyncFunction"
      ) {
        let retv: any;
        let orginalMethod = obj.set[key];

        let temp = async function (...props: any) {
          let clear = setInterval(() => {
            !obj.__.onSetInProgress && update(obj);
          }, 500);
          try {
            retv = await orginalMethod.call(obj, ...props);
          } catch (e) {
            catchError(e, key);
          } finally {
            if (clear) {
              if (!obj.__.onSetInProgress) {
                update(obj);
                obj.__.setList.push(temp);
              }
              clearInterval(clear);
            }
          }
          return retv;
        };
        obj.set[key] = temp;
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

export const setEffect = (fn: Function, deps: Function[]) => {
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
};

export let stateChanged = function (
  state: any,
  throttle: number,
  updateSiblings: any
) {
  if (!state.__.clearTimeOut) {
    state.__.clearTimeOut = window.setTimeout(() => {
      if (state.onSet) {
        state.__.onSetInProgress = true;
        stateUpdateContext = state;
        try {
          state.onSet();
        } catch (e) {
          console.error("error in onSet", e);
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
};

function hasTimer(fn: Function) {
  return (
    fn &&
    typeof fn === "function" &&
    (fn.toString().includes("setTimeout") ||
      fn.toString().includes("setInterval"))
  );
}
