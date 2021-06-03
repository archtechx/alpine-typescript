type ComponentConstructor = (...args: any[]) => object;

export abstract class AlpineComponent {
    /** Retrieve the root component DOM node. */
    $el!: AlpineElement;

    /** Retrieve DOM elements marked with x-ref inside the component. */
    $refs!: { [name: string]: AlpineElement };

    /** Retrieve the native browser "Event" object within an event listener. */
    $event!: Event;

    /** Create a CustomEvent and dispatch it using .dispatchEvent() internally. */
    $dispatch!: (event: string, data: object) => void;

    /** Execute a given expression AFTER Alpine has made its reactive DOM updates. */
    $nextTick!: (callback: (_: any) => void) => void;

    /** Will fire a provided callback when a component property you "watched" gets changed. */
    $watch!: (property: string, callback: (value: any) => void) => void;

    [key: string]: any;
}

export interface Alpine {
    version: string;
    pauseMutationObserver: boolean;
    magicProperties: { [name: string]: (el: AlpineElement) => void };
    ignoreFocusedForValueBinding: boolean;
    onComponentInitializeds: Array<(component: ComponentController) => void>;
    onBeforeComponentInitializeds: Array<(component: ComponentController) => void>;
    onComponentInitialized: (
        callback: (component: ComponentController) => void,
    ) => void;
    onBeforeComponentInitialized: (
        callback: (component: ComponentController) => void,
    ) => void;
    listenForNewUninitializedComponentsAtRunTime: () => undefined;
    discoverUninitializedComponents: (
        callback: (rootEl: AlpineElement) => void,
        el?: AlpineElement,
    ) => void;
    discoverComponents: (callback: (rootEl: AlpineElement) => void) => void;
    start: () => void;
    addMagicProperty: (
        name: string,
        callback: ($el: AlpineElement) => void,
    ) => void;
    clone: (component: ComponentController, newEl: AlpineElement) => void;

    [key: string]: any;
}

export declare interface ComponentController {
    $el: AlpineElement;
    $data: any;
    $nextTickStack: CallableFunction[];
    $showDirectiveStack: any[];
    $watchers: { [name: string]: CallableFunction };
    unobservedData: AlpineComponent;
    getUnobservedData: () => AlpineComponent;
    updateElements: (rootEl: AlpineElement, extraVars?: () => {}) => void;
    updateElement: (el: AlpineElement, extraVars?: () => {}) => void;
    evaluateReturnExpression: (
        el: AlpineElement,
        expression: string,
        extraVars?: () => {}
    ) => void;
    [key: string]: any;
}

export function registerComponents(components: { [name: string]: Function }): { [name: string]: ComponentConstructor } {
    Object.entries(components).forEach(([name, file]) => {
        component(name, file);
    });

    return window.AlpineComponents;
}

export function component(name: string, component: Function = null): ComponentConstructor {
    if (! component) {
        return window.AlpineComponents[name];
    }

    if (component['prototype'] instanceof AlpineComponent) {
        component = convertClassToAlpineConstructor(component);
    }

    window.AlpineComponents[name] = component;

    return component as ComponentConstructor;
}

export function convertClassToAlpineConstructor(component: any): ComponentConstructor {
    return function (...args: any[]) {
        let instance: AlpineComponent = new component(...args);

        // Copy methods
        const methods = Object.getOwnPropertyNames(
            Object.getPrototypeOf(instance)
        )
            .reduce((obj, method) => {
                obj[method] = instance[method];

                return obj;
            }, {});

        // Copy properties
        return Object.assign(methods, instance);
    }
}

export function addTitles(): void {
    window.Alpine.onBeforeComponentInitialized((component: ComponentController) => {
        if (! component.$el.hasAttribute('x-title')) {
            if (component.$data.constructor.prototype instanceof AlpineComponent) {
                component.$el.setAttribute('x-title', component.$data.constructor.name);
            }
        }
    });
}

export function bootstrap(): void {
    window.AlpineComponents = {};

    const deferrer = window.deferLoadingAlpine || function (callback: CallableFunction) { callback() };

    window.deferLoadingAlpine = function (callback: Function) {
        window.Alpine.component = component;

        deferrer(callback);
    }
}

if (window.AlpineComponents === undefined) {
    bootstrap();
}

export interface AlpineElement extends HTMLElement {
    __x: ComponentController;
    [key: string]: any;
}

declare global {
    interface Window {
        Alpine: Alpine;
        deferLoadingAlpine: any;
        AlpineComponents: any;
    }
}
