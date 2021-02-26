declare type ComponentConstructor = (...args: any[]) => object;
export declare class AlpineComponent {
    /** Retrieve the root component DOM node. */
    $el?: Element;
    /** Retrieve DOM elements marked with x-ref inside the component. */
    $refs?: {
        [name: string]: Element;
    };
    /** Retrieve the native browser "Event" object within an event listener. */
    $event?: Event;
    /** Create a CustomEvent and dispatch it using .dispatchEvent() internally. */
    $dispatch?: (event: string, data: object) => void;
    /** Execute a given expression AFTER Alpine has made its reactive DOM updates. */
    $nextTick?: (callback: () => void) => void;
    /** Will fire a provided callback when a component property you "watched" gets changed. */
    $watch?: (property: string, callback: (value: any) => void) => void;
}
export declare function registerComponents(components: {
    [name: string]: Function;
}): {
    [name: string]: ComponentConstructor;
};
export declare function component(name: string, component?: Function): ComponentConstructor;
export declare function convertClassToAlpineConstructor(component: any): ComponentConstructor;
declare const _default: () => void;
export default _default;
