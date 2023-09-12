import { canUseDOM } from 'exenv';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { WebStorageUpdateEvent, buildEventName, isWebStorageUpdateEvent } from './events/WebStorageUpdateEvent';


export type StorageValue<T> = T | null;

export type StorageProvider = {
  /**
   * The name of the storage
   */
  get name(): string;

  /**
   * Returns the storage. Can be null when the storage is not supported by the
   * browser or security settings of the user.
   */
  get storage(): Storage | null;
};

export type UseWebStorageHookOptions<T> = {
  parse?: boolean;
  fallback?: StorageValue<T>;
};

export type UseWebStorageHookResult<T> = {
  value: StorageValue<T>;
  setItem: (value: T) => void;
  removeItem: () => void;
};

/**
 * A hook to store and access values from a storage. This hook is an abstraction
 * for other hooks. These other hooks can define a specific provider like local
 * storage or session storage to save and access the values based from the
 * underlaying storage.
 *
 * @param provider the provider that defines which storage implementation to use
 * @param key the storage key
 * @param options specifies the behaviour of the hook.
 * @returns the value for the given key with set and remove functions to manage the storage.
 */
export function useWebStorage<T = unknown>(
  provider: StorageProvider,
  key: string,
  options: UseWebStorageHookOptions<T> = {},
): UseWebStorageHookResult<T> {
  const { parse, fallback } = { parse: false, fallback: null, ...options };

  const readItem = useCallback((): StorageValue<T> => {
    if (!canUseDOM) {
      return fallback ?? null;
    }

    const item = provider.storage?.getItem(key);
    if (!item) {
      return fallback;
    }

    if (!parse) {
      return item as unknown as T;
    }

    return JSON.parse(item) as T;
  }, [provider, key, fallback, parse]);

  const [value, setValue] = useState(fallback);

  const setItem = useCallback((value: StorageValue<T>): void => {
    const event = new WebStorageUpdateEvent(provider.name, key, value);
    window.dispatchEvent(event);
    provider.storage?.setItem(key, parse ? JSON.stringify(value) : value as unknown as string);
  }, [provider, key, parse]);

  const removeItem = useCallback((): void => {
    const event = new WebStorageUpdateEvent(provider.name, key, null);
    window.dispatchEvent(event);
    provider.storage?.removeItem(key);
  }, [provider, key]);

  const onUpdateValue = useCallback((event: Event): void => {
    if (!isWebStorageUpdateEvent<T>(event)) {
      return;
    }

    setValue(event.detail.value);
  }, [setValue]);

  const onUpdateStorage = useCallback((event: StorageEvent): void => {
    if (event.storageArea !== provider.storage) {
      return;
    }

    if (event.key !== key || event.newValue === value) {
      return;
    }

    if (parse && event.newValue !== null) {
      setValue(JSON.parse(event.newValue) as T);
      return;
    }

    setValue((event.newValue ?? fallback) as unknown as T);
  }, [provider, key, parse, fallback, value, setValue]);

  useEffect(() => {
    setValue(readItem());
    // We only want this to run initially on mount:
    //
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect((): () => void => {
    const eventName = buildEventName(provider.name, key);
    window.addEventListener(eventName, onUpdateValue);
    window.addEventListener('storage', onUpdateStorage);

    return (): void => {
      window.removeEventListener(eventName, onUpdateValue);
      window.removeEventListener('storage', onUpdateStorage);
    };
  }, [provider, key, onUpdateValue, onUpdateStorage]);

  return useMemo<UseWebStorageHookResult<T>>(() => {
    return { value, setItem, removeItem };
  }, [value, setItem, removeItem]);
}
