# react-hook-webstorage

[![Tests & Validations](https://github.com/schorfES/react-hook-webstorage/actions/workflows/ci.yml/badge.svg)](https://github.com/schorfES/react-hook-webstorage/actions/workflows/ci.yml)

`react-hook-webstorage` offers a collection of React hooks designed to simplify the management of data on top of the [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API) and implements LocalStorage and SessionStorage. Whether you're building a small application or a large-scale project, these hooks provide an efficient way to handle persistent data in your React applications.

Components using the following hooks will rerender when another component changes the value of its controlled storage key. This is useful for updating the UI consistently.

## Table of Contents

1. [Installation](#installation)
2. [The hooks](#the-hooks)
   - [`useLocalStorage`](#uselocalstorage)
   - [`useSessionStorage`](#usesessionstorage)
   - [`useWebStorage`](#usewebstorage)
3. [License](#license)

## Installation

To install `react-hook-webstorage` as [NPM package](https://www.npmjs.com/package/react-hook-webstorage), use your preferred package manager:

```bash
npm install react-hook-webstorage
# or
yarn add react-hook-webstorage
```

## The hooks

All hooks return an object with the following properties:

- `value`: The current value stored in the storage for the specified key.
- `setItem`: A function to set a new value for the specified key in the storage.
- `removeItem`: A function to remove the value for the specified key from the storage.

### `useLocalStorage()`

```jsx
import { useLocalStorage } from 'react-hook-webstorage';

function Component() {
  const { value, setItem, removeItem } = useLocalStorage('storage-key', {
    parse: true,
    fallback: 'default-value',
  });

  return (
    // Your component JSX here
  );
}
```

### `useSessionStorage`

```jsx
import { useSessionStorage } from 'react-hook-webstorage';

function Component() {
  const { value, setItem, removeItem } = useSessionStorage('storage-key', {
    parse: false,
    fallback: null,
  });

  return (
    // Your component JSX here
  );
}
```

### `useWebStorage`

The `useWebStorage` hook provides a flexible foundation for creating custom storage solutions based on the [Web Storage Interface](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API). This allows developers to extend the library's functionality or implement specific storage requirements. Below is a guide on how to use `useWebStorage` to build a custom storage solution.

#### Building Custom Storage with `useWebStorage`

##### Creating a Custom Storage Provider

To create a custom storage provider, implement the `StorageProvider` interface.
Here's an example of a custom storage provider for a hypothetical `CustomStorage`:

```typescript
import { StorageProvider } from 'react-hook-webstorage';

export const CustomStorageProvider: StorageProvider = {
  get name() {
    return 'custom-storage';
  },
  get storage() {
    // Implement your custom logic to get the storage instance
    // This could be an in-memory storage, a database, or any other custom solution
    return getCustomStorageInstance();
  },
};
```

##### Using `useWebStorage` with Custom Storage to build a custom hook

Now, you can use the `useWebStorage` hook with your custom storage provider:

```typescript
import { useWebStorage } from 'react-hook-webstorage';

import { CustomStorageProvider } from './CustomStorageProvider';

export type UseCustomStorageHookOptions<T = unknown> = UseWebStorageHookOptions<T>;
export type UseCustomStorageHookResult<T = unknown> = UseWebStorageHookResult<T>;
export type UseCustomStorageHook = typeof useCustomStorage;

export function useCustomStorage<T = unknown>(
  key: string,
  options: UseCustomStorageHookOptions<T> = {},
): UseCustomStorageHookResult<T> {
  return useWebStorage<T>(CustomStorageProvider, key, options);
}
```

## License

[LICENSE (MIT)](./LICENSE)
