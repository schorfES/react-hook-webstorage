export type WebStorageErrorEventDetail = {
  error: unknown;
};

export function buildEventName(provider: string): string {
  return `react-hook-webstorage:${provider}:error`;
}

export class WebStorageErrorEvent extends CustomEvent<WebStorageErrorEventDetail> {
  constructor(provider: string, error: unknown) {
    const eventName = buildEventName(provider);
    super(eventName, { detail: { error } });
  }
}
