declare const window: any;

type ComponentConstructor = (...args: any[]) => object;

export abstract class AlpineComponent {
    /** Retrieve the root component DOM node. */
    $el!: HTMLElement;

    /** Retrieve DOM elements marked with x-ref inside the component. */
    $refs!: { [name: string]: HTMLElement };

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
	magicProperties: { [name: string]: (el: HTMLElement) => void };
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
		callback: (rootEl: HTMLElement) => void,
		el?: HTMLElement,
	) => void;
	discoverComponents: (callback: (rootEl: HTMLElement) => void) => void;
	start: () => void;
	addMagicProperty: (
		name: string,
		callback: ($el: HTMLElement) => void,
	) => void;
	clone: (component: ComponentCComponentControllerontroller, newEl: HTMLElement) => void;

	[key: string]: any;
}

export declare interface ComponentController {
	$el: HTMLElement;
	$data: ProxyConstructor;
	$nextTickStack: CallableFunction[];
	$showDirectiveStack: any[];
	$watchers: { [name: string]: CallableFunction };
	unobservedData: AlpineComponentData;
	getUnobservedData: () => AlpineComponentData;
	updateElements: (rootEl: HTMLElement, extraVars?: () => {}) => void;
	updateElement: (el: HTMLElement, extraVars?: () => {}) => void;
	evaluateReturnExpression: (
		el: HTMLElement,
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
    window.Alpine.onBeforeComponentInitialized((component: AlpineComponent) => {
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
