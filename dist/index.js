"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrap = exports.addTitles = exports.convertClassToAlpineConstructor = exports.component = exports.registerComponents = exports.AlpineComponent = void 0;
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
    window.AlpineComponents[name] = component;
    return component;
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
function addTitles() {
    window.Alpine.onBeforeComponentInitialized((component) => {
        if (!component.$el.hasAttribute('x-title')) {
            if (component.$data.constructor.prototype instanceof AlpineComponent) {
                component.$el.setAttribute('x-title', component.$data.constructor.name);
            }
        }
    });
}
exports.addTitles = addTitles;
function bootstrap() {
    window.AlpineComponents = {};
    const deferrer = window.deferLoadingAlpine || function (callback) { callback(); };
    window.deferLoadingAlpine = function (callback) {
        window.Alpine.component = component;
        deferrer(callback);
    };
}
exports.bootstrap = bootstrap;
if (window.AlpineComponents === undefined) {
    bootstrap();
}
