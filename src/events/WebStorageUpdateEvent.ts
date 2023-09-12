export type WebStorageErrorEventDetail<T> = {
  value: T,
};

export function buildEventName(provider: string, key: string): string {
  return `react-hook-webstorage:${provider}:update:${key}`;
}

export class WebStorageUpdateEvent<T> extends CustomEvent<WebStorageErrorEventDetail<T>> {
  constructor(provider: string, key: string, value: T) {
    const eventName = buildEventName(provider, key);
    super(eventName, { detail: { value } });
  }
}
