import type {
  StorageProvider,
  UseWebStorageHookOptions,
  UseWebStorageHookResult,
} from '../useWebStorage';
import { useWebStorage } from '../useWebStorage';


export type UseSessionStorageHookOptions<T = unknown> = UseWebStorageHookOptions<T>;

export type UseSessionStorageHookResult<T = unknown> = UseWebStorageHookResult<T>;

export type UseSessionStorageHook = typeof useSessionStorage;

const SessionStorageProvider: StorageProvider = {
  get name() {
    return 'session-storage';
  },
  get storage() {
    try {
      return window.sessionStorage;
    } catch (error: unknown) /* istanbul ignore next */ {
      // This should normally not happen for most of the users. Browsers that
      // uses a high security setting and prevent the creation or usage of
      // 1st party cookies also reject the access to session storage (cookie-like
      // storage).
      //
      // In these cases a DOMException is thrown:
      // Failed to read the 'sessionStorage' property from 'Window': Access is
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
 * A hook to store and access values from the session storage by given key.
 * Updates to the storage by the given key are automatically populated to other
 * subscribes using the same key.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage
 * @param key the storage key
 * @param options specifies the behaviour of the hook.
 * @returns the value for the given key with set and remove functions to manage the storage.
 */
export function useSessionStorage<T = unknown>(
  key: string,
  options: UseSessionStorageHookOptions<T> = {},
): UseSessionStorageHookResult<T> {
  return useWebStorage(SessionStorageProvider, key, options);
}
