declare const window: any;

type ComponentConstructor = (...args: any[]) => object;

export class AlpineComponent {
    /** Retrieve the root component DOM node. */
    $el?: Element;

    /** Retrieve DOM elements marked with x-ref inside the component. */
    $refs?: { [name: string]: Element };

    /** Retrieve the native browser "Event" object within an event listener. */
    $event?: Event;

    /** Create a CustomEvent and dispatch it using .dispatchEvent() internally. */
    $dispatch?: (event: string, data: object) => void;

    /** Execute a given expression AFTER Alpine has made its reactive DOM updates. */
    $nextTick?: (callback: () => void) => void;

    /** Will fire a provided callback when a component property you "watched" gets changed. */
    $watch?: (property: string, callback: (value: any) => void) => void;
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

    // @ts-ignore
    window.AlpineComponents[name] = component;
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

export default () => {
    window.AlpineComponents = {};

    const deferrer = window.deferLoadingAlpine || function (callback: CallableFunction) { callback() };

    window.deferLoadingAlpine = function (callback: Function) {
        window.Alpine.component = component;

        deferrer(callback);
    }
}
