# TypeScript support for Alpine.js

This package provides full support for class components in Alpine.js using a thin TypeScript layer.

It's used like this:

**Register a component**
```ts
import DarkModeToggle from './darkModeToggle';

Alpine.component('darkModeToggle', DarkModeToggle);
```

**Use it in a template**
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
import ExampleComponent from './ExampleComponent';
import { component } from '@leanadmin/alpine-typescript';

component('example', ExampleComponent);
```

Which will make it accessible using `Alpine.component('example')('foo', 'bar)`.

**Note: You may notice that `Alpine.component()` can also be used to register components. However, it's better to avoid using it.** The reason for this is that `window.Alpine` might not yet be accessible when you're registering components, and if it is, it's possible that it's already evaluated some of the `x-data` attributes. `component()` is guaranteed to work. And of course, you can alias the import if you wish to use a different name.

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

# Real-world example

Here's a practical example that uses constructors, `init()`, refs, events, and includes dependencies the right way.

This example uses the Alpine component that we use for search on the [Lean documentation site](https://lean-admin.dev).

<details>
<summary>resources/js/app.ts</summary>

```ts
declare global {
    interface Window {
        Alpine: any;
    }
}

import { component } from '@leanadmin/alpine-typescript';
import Search from './search';

component('search', Search);

import 'alpinejs';
```

</details>

**`app.ts` highlights:**
- It's a good idea to declare the `Alpine` property on `Window` in case you need to use `window.Alpine`
- We initialize each component by calling `component()`
- We import Alpine *after* this package

<details>
<summary>resources/js/search.js</summary>

```ts
import { AlpineComponent } from '@leanadmin/alpine-typescript';

type AlgoliaIndex = {
    search: Function,
};

type Result = any;

export default class Search extends AlpineComponent {
    search: string = '';
    results: Result[] = [];

    constructor(
        public index: AlgoliaIndex,
    ) {
        super();
    }

    previousResult(): void {
        let result = this.currentResult();

        if (! result) {
            if (this.results.length) {
                // First result
                this.getResult(0).focus();
            } else if (this.search.length) {
                // Re-fetch results
                this.queryAlgolia();
            }

            return;
        }

        if (result.previousElementSibling instanceof HTMLElement && result.previousElementSibling.tagName === 'A') {
            (result.previousElementSibling).focus();
        } else {
            // Last result
            this.getResult(this.results.length - 1).focus();
        }
    };

    nextResult(): void {
        let result = this.currentResult();

        if (! result) {
            if (this.results.length) {
                // First result
                this.getResult(0).focus();
            } else if (this.search.length) {
                // Re-fetch results
                this.queryAlgolia();
            }

            return;
        }

        if (result.nextElementSibling instanceof HTMLElement) {
            result.nextElementSibling.focus();
        } else {
            // First result
            this.getResult(0).focus();
        }
    };

    getResult(index: number): HTMLElement {
        return this.$refs.results.children[index + 1] as HTMLElement;
    };

    currentResult(): HTMLElement|null {
        if (! this.$refs.results.contains(document.activeElement)) {
            return null;
        }

        return document.activeElement as HTMLElement;
    };

    queryAlgolia(): void {
        if (this.search) {
            this.index.search(this.search, {
                hitsPerPage: 3,
            }).then(({ hits }) => {
                this.results = hits.filter((hit: Result) => {
                    // Remove duplicate results
                    const occurances: any[] = hits.filter((h: Result) => h.hierarchy.lvl1 === hit.hierarchy.lvl1);

                    return occurances.length === 1;
                });

                this.results.forEach((result: Result) => {
                    // Clean displayed text
                    if (result._highlightResult && result._highlightResult.content) {
                        return result._highlightResult.content.value.replace(' ', '');
                    }
                });

                if (this.results.length) {
                    this.$nextTick(() => this.getResult(0).focus());
                }
            })
        } else {
            this.results = [];

            this.$refs.search.focus();
        }
    };

    init(): void {
        this.$watch('search', () => this.queryAlgolia());
    }
}
```

</details>

**`search.js` highlights:**
- We `export default` the class
- We have to call `super()` if we define a constructor
- Sometimes, we have to use `as HTMLElement` because the DOM API can return `Element` which doesn't have methods like `focus()`
- We define an `init()` method and can access magic properties there
- We create helper types for consistency among parameters and return types, even if the type is `any` because we don't know much about the structure. Especially useful for API calls.

<details>
<summary>page.blade.php</summary>

```html
<div
    class="relative w-full text-gray-400 focus-within:text-gray-600"
    x-data="Alpine.component('search')(
        algoliasearch('<truncated key>', '<truncated key>').initIndex('lean-admin')
    )"
    x-init="init"
    @click.away="results = []"
    @keydown.arrow-up.prevent="previousResult()"
    @keydown.arrow-down.prevent="nextResult()"
    @keydown="if (document.activeElement !== $refs.search && ! ['ArrowUp', 'ArrowDown', 'Enter', 'Tab' ].includes($event.key)) $refs.search.focus()"
>
    <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center">
        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"></path>
        </svg>
    </div>
    <input @keydown.s.away="
        if (['s', '/'].includes($event.key)) {
            $refs.search.focus();

            if (! $refs.results.contains($event.target)) {
                // Don't type the 's' or '/' unless it was within the search results.
                $event.preventDefault();
            }
        }
    " x-ref="search" x-model.debounce="search" id="search" class="block h-full w-full rounded-md py-2 pl-8 pr-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 sm:text-sm" placeholder="Search" type="search">
    <div id="search-results" x-ref="results" x-show="results.length" class="max-w-full relative z-20 -mt-2 shadow-outline-purple bg-white">
        <template x-if="results" x-for="result in results">
            ...
        </template>
    </div>
</div>
```

</details>

**`page.blade.php` highlights:**
- We call the component in `x-data`
- We use both the constructor and `init`. The constructor cannot access magic properties, `init` can.
- We can still use Alpine syntax in the template with no issues
