Certainly! Below is the updated documentation with the added section describing the returned values of all hooks:

# react-storage-hooks

`react-storage-hooks` offers a collection of React hooks designed to simplify the management of data on top of the [Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Storage) and implements local storage and session storage. Whether you're building a small application or a large-scale project, these hooks provide an efficient way to handle persistent data in your React applications.

## Table of Contents

1. [Installation](#installation)
2. [Usage](#usage)
   - [Returned Values](#returned-values)
   - [`useLocalStorage`](#uselocalstorage)
   - [`useSessionStorage`](#usesessionstorage)
   - [`useWebStorage`](#usewebstorage)
3. [Building Custom Storage with `useWebStorage`](#building-custom-storage-with-usewebstorage)
4. [License](#license)

## Installation

To install `react-storage-hooks`, use your preferred package manager:

```bash
npm install react-storage-hooks
# or
yarn add react-storage-hooks
```

## Usage

All hooks return an object with the following properties:

- `value`: The current value stored in the storage for the specified key.
- `setItem`: A function to set a new value for the specified key in the storage.
- `removeItem`: A function to remove the value for the specified key from the storage.

### `useLocalStorage()`

```jsx
import { useLocalStorage } from 'react-storage-hooks';

function Component() {
  const { value, setItem, removeItem } = useLocalStorage('-key', {
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
import { useSessionStorage } from 'react-storage-hooks';

function Component() {
  const { value, setItem, removeItem } = useSessionStorage('-key', {
    parse: false,
    fallback: null,
  });

  return (
    // Your component JSX here
  );
}
```

### `useWebStorage`

The `useWebStorage` hook provides a flexible foundation for creating custom storage solutions based on the [Storage Interface](https://developer.mozilla.org/en-US/docs/Web/API/Storage). This allows developers to extend the library's functionality or implement specific storage requirements. Below is a guide on how to use `useWebStorage` to build a custom storage solution.

## Building Custom Storage with `useWebStorage`

### Creating a Custom Storage Provider

To create a custom storage provider, implement the `StorageProvider` interface:

```typescript
export type CustomStorageProvider = {
  name: string;
  storage: Storage | null;
};
```

Here's an example of a custom storage provider for a hypothetical `CustomStorage`:

```typescript
export const CustomStorageProvider: CustomStorageProvider = {
  name: 'custom-storage',
  get storage() {
    // Implement your custom logic to get the storage instance
    // This could be an in-memory storage, a database, or any other custom solution
    return getCustomStorageInstance();
  },
};
```

### Using `useWebStorage` with Custom Storage to build a custom hook

Now, you can use the `useWebStorage` hook with your custom storage provider:

```typescript
import { useWebStorage } from 'react-storage-hooks';

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
