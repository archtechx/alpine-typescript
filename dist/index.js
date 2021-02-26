"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertClassToAlpineConstructor = exports.component = exports.registerComponents = exports.AlpineComponent = void 0;
class AlpineComponent {
}
exports.AlpineComponent = AlpineComponent;
function registerComponents(components) {
    Object.entries(components).forEach(([name, file]) => {
        component(name, file);
    });
    return window.AlpineComponents;
}
exports.registerComponents = registerComponents;
function component(name, component = null) {
    if (!component) {
        return window.AlpineComponents[name];
    }
    if (component['prototype'] instanceof AlpineComponent) {
        component = convertClassToAlpineConstructor(component);
    }
    // @ts-ignore
    window.AlpineComponents[name] = component;
}
exports.component = component;
function convertClassToAlpineConstructor(component) {
    return function (...args) {
        let instance = new component(...args);
        // Copy methods
        const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(instance))
            .reduce((obj, method) => {
            obj[method] = instance[method];
            return obj;
        }, {});
        // Copy properties
        return Object.assign(methods, instance);
    };
}
exports.convertClassToAlpineConstructor = convertClassToAlpineConstructor;
exports.default = () => {
    window.AlpineComponents = {};
    const deferrer = window.deferLoadingAlpine || function (callback) { callback(); };
    window.deferLoadingAlpine = function (callback) {
        window.Alpine.component = component;
        deferrer(callback);
    };
};
