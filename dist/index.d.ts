declare type ComponentConstructor = (...args: any[]) => object;
export declare abstract class AlpineComponent {
    /** Retrieve the root component DOM node. */
    $el: HTMLElement;
    /** Retrieve DOM elements marked with x-ref inside the component. */
    $refs: {
        [name: string]: HTMLElement;
    };
    /** Retrieve the native browser "Event" object within an event listener. */
    $event: Event;
    /** Create a CustomEvent and dispatch it using .dispatchEvent() internally. */
    $dispatch: (event: string, data: object) => void;
    /** Execute a given expression AFTER Alpine has made its reactive DOM updates. */
    $nextTick: (callback: (_: any) => void) => void;
    /** Will fire a provided callback when a component property you "watched" gets changed. */
    $watch: (property: string, callback: (value: any) => void) => void;
    [key: string]: any;
}
export interface Alpine {
    version: string;
    pauseMutationObserver: boolean;
    magicProperties: {
        [name: string]: (el: HTMLElement) => void;
    };
    ignoreFocusedForValueBinding: boolean;
    onComponentInitializeds: Array<(component: ComponentController) => void>;
    onBeforeComponentInitializeds: Array<(component: ComponentController) => void>;
    onComponentInitialized: (callback: (component: ComponentController) => void) => void;
    onBeforeComponentInitialized: (callback: (component: ComponentController) => void) => void;
    listenForNewUninitializedComponentsAtRunTime: () => undefined;
    discoverUninitializedComponents: (callback: (rootEl: HTMLElement) => void, el?: HTMLElement) => void;
    discoverComponents: (callback: (rootEl: HTMLElement) => void) => void;
    start: () => void;
    addMagicProperty: (name: string, callback: ($el: HTMLElement) => void) => void;
    clone: (component: ComponentController, newEl: HTMLElement) => void;
    [key: string]: any;
}
export declare interface ComponentController {
    $el: HTMLElement;
    $data: ProxyConstructor;
    $nextTickStack: CallableFunction[];
    $showDirectiveStack: any[];
    $watchers: {
        [name: string]: CallableFunction;
    };
    unobservedData: AlpineComponent;
    getUnobservedData: () => AlpineComponent;
    updateElements: (rootEl: HTMLElement, extraVars?: () => {}) => void;
    updateElement: (el: HTMLElement, extraVars?: () => {}) => void;
    evaluateReturnExpression: (el: HTMLElement, expression: string, extraVars?: () => {}) => void;
    [key: string]: any;
}
export declare function registerComponents(components: {
    [name: string]: Function;
}): {
    [name: string]: ComponentConstructor;
};
export declare function component(name: string, component?: Function): ComponentConstructor;
export declare function convertClassToAlpineConstructor(component: any): ComponentConstructor;
export declare function addTitles(): void;
export declare function bootstrap(): void;
declare global {
    interface Window {
        Alpine: Alpine;
        deferLoadingAlpine: any;
        AlpineComponents: any;
    }
}
export {};
