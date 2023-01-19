export declare class ActionStore {
    subscriptions: never[];
    clearTimeOut: null;
    version: number;
    siblings: never[];
}
export declare let subScribe: (obj: any, func: any, label: any) => void;
export declare let update: (obj: any, throttle?: number, updateSiblings?: boolean) => void;
export declare let updateAll: () => void;
export declare let unSubscribe: (obj: any, label: any) => void;
export declare let stateChanged: (state: any, throttle: number, updateSiblings: any) => void;
export declare const getRandom: (length: number) => string;
declare const useGetSet: (...props: any) => void;
export default useGetSet;
