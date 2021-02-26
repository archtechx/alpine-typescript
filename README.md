# TypeScript support for Alpine.js

This package provides full support for class components in Alpine.js using a thin TypeScript layer.

It's used like this:

**Register a component**
```ts
import { DarkModeToggle } from './darkModeToggle';

Alpine.component('darkModeToggle', DarkModeToggle);
```

**Use it a template**
```html
<div x-data="Alpine.component('darkModeToggle')()" x-init="init()">
    <button type="button" @click="switchTheme()">Switch theme</button>
</div>
```

## Installation

```
npm install --save-dev @leanadmin/alpine-typescript
```

The package will automatically initialize itself when needed, i.e. when one of its components is used in the currently executed JS bundle.

If you'd like to initialize it manually, you can use:

```ts
import { bootstrap } from '@leanadmin/alpine-typescript';

bootstrap();
```

## Usage

You can use a component by calling `Alpine.component('componentName')(arg1, arg2)`. If your component has no arguments, still append `()` at the end of the call.

The `component()` call itself returns a function for creating instances of the component. Invoking the function ensures that the component has a unique instance each time.

```html
<div x-data="Alpine.component('darkModeToggle')()" x-init="init()">
    <button type="button" @click="switchTheme()">Switch theme</button>
</div>
```

```html
<div x-data="Alpine.component('searchableSelect')({ options: ['Foo', 'Bar'] })" x-init="init()">
    <div x-spread="options">
        ...
    </div>
</div>
```

## Creating components

To create a component, you need to create the component object and register it using one of the provided helpers.

Component objects can be:
- classes
- functions returning plain objects

In the context of plain objects, the wrapper function acts as a constructor that can pass initial data to the object.

## Registering components

A component can be registered like this:
```ts
import { ExampleComponent } from './ExampleComponent';
import { component } from '@leanadmin/alpine-typescript';

component('example', ExampleComponent);
```

Which will make it accessible using `Alpine.component('example')('foo', 'bar)`.

**Note: It's better to avoid using `Alpine.component('example', ExampleComponent)`** even if it might work in some cases. The reason for this is that `window.Alpine` might not yet be accessible when you're registering components, and if it is, it's possible that it's already evaluated some of the `x-data` attributes. `component()` is guaranteed to work. And of course, you can alias the import if you wish to use a different name.

To register multiple components, you can use the `registerComponents()` helper.

This can pair well with scripts that crawl your e.g. `alpine/` directory to register all components using their file names.

```ts
// alpine/index.js

import { registerComponents } from '@leanadmin/alpine-typescript';

const files = require.context('./', true, /.*.ts/)
    .keys()
    .map(file => file.substr(2, file.length - 5)) // Remove ./ and .ts
    .filter(file => file !== 'index')
    .reduce((files: { [name: string]: Function }, file: string) => {
        files[file] = require(`./${file}.ts`).default;

        return files;
}, {});

registerComponents(files);
```

## Class components

You can create class components by extending `AlpineComponent` and exporting the class as `default`.

`AlpineComponent` provides full IDE support for Alpine's magic properties. This means that you can use `this.$el`, `this.$nextTick(() => this.foo = this.bar)`, and more with perfect type enforcement.

```ts
import { AlpineComponent } from '@leanadmin/alpine-typescript';

export default class DarkModeToggle extends AlpineComponent {
    public theme: string|null = null;

    /** Used for determining the transition direction. */
    public previousTheme: string|null = null;

    public browserTheme(): string {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    public switchTheme(theme: string): void {
        this.$nextTick(() => this.previousTheme = this.theme);

        this.theme = theme;

        window.localStorage.setItem('leanTheme', theme);

        this.updateDocumentClass(theme);
    }

    // ...

    public init(): void {
        this.loadStoredTheme();
        this.registerListener();
    }
}
```

## Plain object components

To register a plain object as an Alpine component, export a function that wraps the object like this:
```ts
export default (foo: string, bar: number) => ({
    foo,
    bar,

    someFunction() {
        console.log(this.foo);
    }
})
```

The function will serve as a "constructor" for the object, setting default values and anything else that's needed.

Note that the `=> ({` part is just syntactic sugar, you're free to use `return` if it's useful in your case:

```ts
export default (foo: string, bar: number) => {
    return {
        foo,
        bar,

        // ...
    }
}
```
