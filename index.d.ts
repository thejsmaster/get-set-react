export declare class ActionStore {
    subscriptions: never[];
    clearTimeOut: null;
    version: number;
    siblings: never[];
    onSetInProgress: boolean;
    setList: never[];
}
export declare function copy(state: any): any;
export declare function saveCopy(state: any, label: string): void;
export declare function getSavedCopy(label: string): any;
export declare let subScribe: (obj: any, func: any, label: any) => void;
export declare let updateAll: () => void;
export declare let unSubscribe: (obj: any, label: any) => void;
export declare const setEffect: (fn: Function, deps: Function[]) => void;
export declare let stateChanged: (state: any, throttle: number, updateSiblings: any) => void;
export declare const getRandom: (length: number) => string;
export declare const useGetSet: (props: any[]) => void;
