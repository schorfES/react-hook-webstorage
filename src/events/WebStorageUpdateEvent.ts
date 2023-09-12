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


// Type guard for custom event:
export function isWebStorageUpdateEvent<T>(event: unknown): event is CustomEvent<WebStorageErrorEventDetail<T>> {
  return event instanceof CustomEvent &&
    'detail' in event && event.detail !== null &&
    'value' in event.detail && event.detail.value !== undefined; // eslint-disable-line @typescript-eslint/no-unsafe-member-access
}
