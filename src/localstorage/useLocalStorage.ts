import type {
  StorageProvider,
  UseWebStorageHookOptions,
  UseWebStorageHookResult,
} from '../useWebStorage';
import { useWebStorage } from '../useWebStorage';


export type UseLocalStorageHookOptions<T = unknown> = UseWebStorageHookOptions<T>;

export type UseLocalStorageHookResult<T = unknown> = UseWebStorageHookResult<T>;

export type UseLocalStorageHook = typeof useLocalStorage;

const LocalStorageProvider: StorageProvider = {
  get name() {
    return 'local-storage';
  },
  get storage() {
    try {
      return window.localStorage;
    } catch (error: unknown) /* istanbul ignore next */ {
      // This should normally not happen for most of the users. Browsers that
      // uses a high security setting and prevent the creation or usage of
      // 1st party cookies also reject the access to local storage (cookie-like
      // storage).
      //
      // In these cases a DOMException is thrown:
      // Failed to read the 'localStorage' property from 'Window': Access is
      // denied for this document.
      //
      // We are going to return null for the storage. The storage hook is going
      // to handle the nullish storage properly.

			// TODO: Log this exception

      return null;
    }
  },
};

/**
 * A hook to store and access values from the local storage by given key.
 * Updates to the storage by the given key are automatically populated to other
 * subscribes using the same key.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
 * @param key the storage key
 * @param options specifies the behaviour of the hook.
 * @returns the value for the given key with set and remove functions to manage the storage.
 */
export function useLocalStorage<T = unknown>(
  key: string,
  options: UseLocalStorageHookOptions<T> = {},
): UseLocalStorageHookResult<T> {
  return useWebStorage(LocalStorageProvider, key, options);
}
