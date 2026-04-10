import { act, renderHook } from '@testing-library/react';

import { useLocalStorage } from '.';


const mockCanUseDomGetter = jest.fn();
jest.mock('exenv', () => {
  return {
    get canUseDOM(): boolean {
      return mockCanUseDomGetter();
    },
  };
});

let originalStorage: Storage | undefined;
const mockLocalStorage = (): void => {
  if (originalStorage) {
    return;
  }

  originalStorage = window.localStorage;
  let values: Record<string, string | null | undefined> = {};
  const storage: Storage = {
    get values() {
      return values;
    },
    getItem: jest.fn((key) => {
      if (key in values) {
        return values[key] ?? null;
      }

      return null;
    }),
    setItem: jest.fn((key: string, value: string | null | undefined) => {
      values[key] = value;
      window.dispatchEvent(new StorageEvent('storage', { key, newValue: value }));
    }),
    removeItem: jest.fn((key: string) => {
      values[key] = null;
      window.dispatchEvent(new StorageEvent('storage', { key, newValue: undefined }));
    }),
    clear: jest.fn(() => {
      values = {};
    }),
    key: jest.fn(() => {
      return 'mocked-local-storage';
    }),
    get length(): number {
      return Object.keys(values).length;
    },
  };

  Object.defineProperty(window, 'localStorage', { value: storage, writable: true });
};

const mockResetLocalStorage = (): void => {
  Object.defineProperty(window, 'localStorage', { value: originalStorage, writable: true });
  originalStorage = undefined;
};


describe('useLocalStorage()', () => {
  beforeEach(() => {
    mockLocalStorage();
  });

  afterEach(() => {
    mockResetLocalStorage();
  });

  describe('client side', () => {
    beforeEach(() => {
      mockCanUseDomGetter.mockReturnValue(true);
    });

    it('should return value by key', () => {
      window.localStorage.values.foo = 'bar';
      const { result } = renderHook(() => {
        return useLocalStorage('foo');
      });

      expect(result.current)
        .toEqual({
          value: 'bar',
          setItem: expect.any(Function),
          removeItem: expect.any(Function),
        });
    });

    it('should return null-value by key when not defined', () => {
      const { result } = renderHook(() => {
        return useLocalStorage('foo');
      });

      expect(result.current)
        .toEqual({
          value: null,
          setItem: expect.any(Function),
          removeItem: expect.any(Function),
        });
    });

    it('should return fallback-value by key when not defined', () => {
      const { result } = renderHook(() => {
        return useLocalStorage('foo', { fallback: 'fallback' });
      });

      expect(result.current)
        .toEqual({
          value: 'fallback',
          setItem: expect.any(Function),
          removeItem: expect.any(Function),
        });
    });

    it('should JSON-parse the value', () => {
      window.localStorage.values.bar = '{"baz": true}';

      const { result } = renderHook(() => {
        return useLocalStorage('bar', { parse: true });
      });

      expect(result.current)
        .toEqual({
          value: { baz: true },
          setItem: expect.any(Function),
          removeItem: expect.any(Function),
        });
    });

    it('should not JSON-parse a fallback-value', () => {
      const { result } = renderHook(() => {
        return useLocalStorage('foo', { parse: true, fallback: '{"baz": true}' });
      });

      expect(result.current)
        .toEqual({
          value: '{"baz": true}',
          setItem: expect.any(Function),
          removeItem: expect.any(Function),
        });
    });

    it('should set a value by key', () => {
      const { result } = renderHook(() => {
        return useLocalStorage('foo');
      });
      const { setItem } = result.current;

      act(() => {
        setItem('baz');
      });

      expect(window.localStorage.setItem)
        .toHaveBeenCalledTimes(1);
      expect(window.localStorage.setItem)
        .toHaveBeenCalledWith('foo', 'baz');

      const { value } = result.current;
      expect(value)
        .toBe('baz');
    });

    it('should set a JSON-stringified value by key with parse option', () => {
      const { result } = renderHook(() => {
        return useLocalStorage('baz', { parse: true });
      });

      const { setItem } = result.current;

      act(() => {
        setItem({ foo: true, baz: false });
      });

      expect(window.localStorage.setItem)
        .toHaveBeenCalledTimes(1);
      expect(window.localStorage.setItem)
        .toHaveBeenCalledWith('baz', '{"foo":true,"baz":false}');

      const { value } = result.current;
      expect(value)
        .toEqual({ foo: true, baz: false });
    });

    it('should remove a value by key', () => {
      window.localStorage.values.quaz = 'delete me!';

      const { result } = renderHook(() => {
        return useLocalStorage('quaz');
      });

      const { removeItem } = result.current;

      act(() => {
        removeItem();
      });

      expect(window.localStorage.removeItem)
        .toHaveBeenCalledTimes(1);
      expect(window.localStorage.removeItem)
        .toHaveBeenCalledWith('quaz');

      const { value } = result.current;
      expect(value)
        .toBeNull();
    });

    it('should not react to updates on not controlled keys', () => {
      window.localStorage.values.foo = 'watch me!';

      const { result } = renderHook(() => {
        return useLocalStorage('foo');
      });

      const before = result.current;
      act(() => {
        window.localStorage.setItem('bar', 'baz');
      });

      expect(result.current).toBe(before);
    });

    it('should not react to updates with same value', () => {
      window.localStorage.values.foo = 'watch me!';

      const { result } = renderHook(() => {
        return useLocalStorage('foo');
      });

      const before = result.current;
      act(() => {
        window.localStorage.setItem('foo', 'watch me!');
      });

      expect(result.current).toBe(before);
    });

    it('should handle updates across other useLocalStorage hooks', () => {
      const { result } = renderHook(() => {
        return useLocalStorage('foo', { fallback: 'update me!' });
      });

      act(() => {
        const init = { detail: { value: 'did it!' } };
        const event = new CustomEvent('react-hook-webstorage:local-storage:update:foo', init);
        window.dispatchEvent(event);
      });

      expect(result.current.value).toBe('did it!');

      const onUpdateFoo = jest.fn();
      const onUpdateBar = jest.fn();
      window.addEventListener('react-hook-webstorage:local-storage:update:foo', onUpdateFoo);
      window.addEventListener('react-hook-webstorage:local-storage:update:bar', onUpdateBar);

      act(() => {
        result.current.setItem('notify me!');
      });

      expect(onUpdateFoo).toHaveBeenCalledTimes(1);
      expect(onUpdateFoo).toHaveBeenCalledWith(
        new CustomEvent('react-hook-webstorage:local-storage:update:foo', {
          detail: {
            value: 'notify me!',
          },
        }),
      );
    });

    it('should handle invalid updates attempts across other useLocalStorage hooks', () => {
      const { result } = renderHook(() => {
        return useLocalStorage('foo', { fallback: 'update me!' });
      });

      act(() => {
        // Wrong event type:
        const event = new MouseEvent('react-hook-webstorage:local-storage:update:foo');
        window.dispatchEvent(event);
      });

      expect(result.current.value).toBe('update me!');

      act(() => {
        // Missing event detail:
        const event = new CustomEvent('react-hook-webstorage:local-storage:update:foo');
        window.dispatchEvent(event);
      });

      expect(result.current.value).toBe('update me!');

      act(() => {
        // Missing "value" in event detail:
        const init = { detail: {} };
        const event = new CustomEvent('react-hook-webstorage:local-storage:update:foo', init);
        window.dispatchEvent(event);
      });

      expect(result.current.value).toBe('update me!');
    });
  });

  describe('server side', () => {
    beforeEach(() => {
      mockCanUseDomGetter.mockReturnValue(false);
    });

    it('should return null on SSR', () => {
      window.localStorage.values.foo = 'do not use me!';

      const { result } = renderHook(() => {
        return useLocalStorage('foo');
      });

      expect(result.current)
        .toEqual({
          value: null,
          setItem: expect.any(Function),
          removeItem: expect.any(Function),
        });
    });

    it('should return fallback on SSR', () => {
      window.localStorage.values.foo = 'do not use me!';

      const { result } = renderHook(() => {
        return useLocalStorage('foo', { fallback: 'fallback' });
      });

      expect(result.current)
        .toEqual({
          value: 'fallback',
          setItem: expect.any(Function),
          removeItem: expect.any(Function),
        });
    });
  });
});
