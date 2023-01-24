import { useEffect, useState } from "react";

export class ActionStore {
  subscriptions = [];
  clearTimeOut = null;
  version = 0;
  siblings = [];
}

function getSetJS<T>(obj: T | any) {
  if (
    obj !== null &&
    obj !== undefined &&
    typeof obj === "object" &&
    !Array.isArray(obj)
  ) {
    let keys = [
      ...Object.keys(obj.__proto__),
      ...Object.keys(obj as object),
    ].filter((key) => key.startsWith("set"));
    console.log(keys);
    keys.forEach((key) => {
      if (hasTimer(obj[key])) {
        console.error(
          "timers not allowed inside set methods. move timers outside the state. get-set-react set methods don't support setTimeout or setInterval timers."
        );
      }
      if (
        typeof obj[key] === "function" &&
        obj[key].constructor.name === "Function"
      ) {
        let retv;
        let orginalMethod = obj[key];
        let temp = function (...props: any) {
          retv = orginalMethod.call(obj, ...props);
          update(obj);
          return retv;
        };
        obj[key] = temp;
      } else if (
        typeof obj[key] === "function" &&
        obj[key].constructor.name === "GeneratorFunction"
      ) {
        console.error("get-set-react does not support generator functions. ");
      } else if (
        typeof obj[key] === "function" &&
        obj[key].constructor.name === "AsyncFunction"
      ) {
        let retv: any;
        let orginalMethod = obj[key];
        let clear = setInterval(() => {
          update(obj);
        }, 500);
        let temp = async function (...props: any) {
          try {
            retv = await orginalMethod.call(obj, ...props);
          } catch (e) {
            console.error("error occured in this async function.");
            return retv;
          } finally {
            if (clear) {
              update(obj);
              clearInterval(clear);
            }
          }
          return retv;
        };
        obj[key] = temp;
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

export let subScribe = function (obj: any, func: any, label: any) {
  let subscription = obj.__.subscriptions.find((d: any) => d.label === label);
  if (!subscription) {
    obj.__.subscriptions.push({ label: label, action: func });
  }
};
export let update = function (
  obj: any,
  // method?: any,
  throttle = 50,
  updateSiblings = false
) {
  //method && method.apply(obj, props);

  obj?.onChange && obj.onChange();
  obj && stateChanged(obj, throttle, updateSiblings);
};
export let updateAll = () => {};
export let unSubscribe = function (obj: any, label: any) {
  obj.__.subscriptions = obj.__.subscriptions.filter(
    (d: any) => d.label !== label
  );
};
export let stateChanged = function (
  state: any,
  throttle: number,
  updateSiblings: any
) {
  if (!state.__.clearTimeOut) {
    state.__.clearTimeOut = window.setTimeout(() => {
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
  console.log(subscriptions);
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

export const useGetSet = function (...props: any) {
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
