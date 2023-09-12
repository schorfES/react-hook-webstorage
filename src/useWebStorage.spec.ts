import { act, renderHook } from '@testing-library/react';

import type { StorageProvider } from './useWebStorage';
import { useWebStorage } from './useWebStorage';


const mockCanUseDomGetter = jest.fn();
jest.mock('exenv', () => {
  return {
    get canUseDOM(): boolean {
      return mockCanUseDomGetter();
    },
  };
});

function createMockStorage(): Storage {
  let state: Record<string, string> = {};
  const storage: Storage = {
    get length() {
      return Object.keys(state).length;
    },
    clear(): void {
      state = {};
    },
    key(index) {
      return Object.keys(state)[index];
    },
    getItem(key) {
      return state[key] ?? null;
    },
    setItem(key, value) {
      state[key] = value;
    },
    removeItem(key) {
      state = Object.entries(state).reduce((acc, [name, value]) => {
        if (name === key) {
          return acc;
        }

        return { ...acc, [name]: value };
      }, {});
    },
  };
  return storage;
}

function createMockProvider(storage: Storage): StorageProvider {
  return {
    get name(): string {
      return 'mock-storage';
    },
    get storage(): Storage {
      return storage;
    },
  };
}

describe('useWebStorage()', () => {
  describe('client side', () => {
    beforeEach(() => {
      mockCanUseDomGetter.mockReturnValue(true);
    });

    it('should return value by key', () => {
      const mockStorage = createMockStorage();
      mockStorage.setItem('foo', 'bar');
      const mockProvider = createMockProvider(mockStorage);

      const { result } = renderHook(() => {
        return useWebStorage(mockProvider, 'foo');
      });

      expect(result.current)
        .toEqual({
          value: 'bar',
          setItem: expect.any(Function),
          removeItem: expect.any(Function),
        });
    });

    it('should return null-value by key when not defined', () => {
      const mockStorage = createMockStorage();
      const mockProvider = createMockProvider(mockStorage);

      const { result } = renderHook(() => {
        return useWebStorage(mockProvider, 'foo');
      });

      expect(result.current)
        .toEqual({
          value: null,
          setItem: expect.any(Function),
          removeItem: expect.any(Function),
        });
    });

    it('should return fallback-value by key when not defined', () => {
      const mockStorage = createMockStorage();
      const mockProvider = createMockProvider(mockStorage);

      const { result } = renderHook(() => {
        return useWebStorage(mockProvider, 'foo', { fallback: 'fallback' });
      });

      expect(result.current)
        .toEqual({
          value: 'fallback',
          setItem: expect.any(Function),
          removeItem: expect.any(Function),
        });
    });

    it('should JSON-parse the value', () => {
      const mockStorage = createMockStorage();
      mockStorage.setItem('bar', '{"baz": true}');
      const mockProvider = createMockProvider(mockStorage);

      const { result } = renderHook(() => {
        return useWebStorage(mockProvider, 'bar', { parse: true });
      });

      expect(result.current)
        .toEqual({
          value: { baz: true },
          setItem: expect.any(Function),
          removeItem: expect.any(Function),
        });
    });

    it('should not JSON-parse a fallback-value', () => {
      const mockStorage = createMockStorage();
      const mockProvider = createMockProvider(mockStorage);

      const { result } = renderHook(() => {
        return useWebStorage(mockProvider, 'foo', { parse: true, fallback: '{"baz": true}' });
      });

      expect(result.current)
        .toEqual({
          value: '{"baz": true}',
          setItem: expect.any(Function),
          removeItem: expect.any(Function),
        });
    });

    it('should set a value by key', () => {
      const mockStorage = createMockStorage();
      const mockProvider = createMockProvider(mockStorage);

      const { result } = renderHook(() => {
        return useWebStorage(mockProvider, 'foo');
      });
      const { setItem } = result.current;

      act(() => {
        setItem('baz');
      });

      expect(mockStorage.getItem('foo')).toBe('baz');

      const { value } = result.current;
      expect(value)
        .toBe('baz');
    });

    it('should set a JSON-stringified value by key with parse option', () => {
      const mockStorage = createMockStorage();
      const mockProvider = createMockProvider(mockStorage);

      const { result } = renderHook(() => {
        return useWebStorage(mockProvider, 'baz', { parse: true });
      });

      const { setItem } = result.current;

      act(() => {
        setItem({ foo: true, baz: false });
      });

      expect(mockStorage.getItem('baz')).toBe('{"foo":true,"baz":false}');

      const { value } = result.current;
      expect(value)
        .toEqual({ foo: true, baz: false });
    });

    it('should remove a value by key', () => {
      const mockStorage = createMockStorage();
      mockStorage.setItem('quaz', 'delete me!');
      const mockProvider = createMockProvider(mockStorage);

      const { result } = renderHook(() => {
        return useWebStorage(mockProvider, 'quaz');
      });

      const { removeItem } = result.current;

      act(() => {
        removeItem();
      });

      expect(mockStorage.getItem('quaz')).toBeNull();

      const { value } = result.current;
      expect(value)
        .toBeNull();
    });

    it('should not react to updates on not controlled keys', () => {
      const mockStorage = createMockStorage();
      mockStorage.setItem('foo', 'watch me!');
      const mockProvider = createMockProvider(mockStorage);

      const { result } = renderHook(() => {
        return useWebStorage(mockProvider, 'foo');
      });

      const before = result.current;
      act(() => {
        mockStorage.setItem('bar', 'baz');
      });

      expect(result.current).toBe(before);
    });

    it('should not react to updates with same value', () => {
      const mockStorage = createMockStorage();
      mockStorage.setItem('foo', 'watch me!');
      const mockProvider = createMockProvider(mockStorage);

      const { result } = renderHook(() => {
        return useWebStorage(mockProvider, 'foo');
      });

      const before = result.current;
      act(() => {
        mockStorage.setItem('foo', 'watch me!');
      });

      expect(result.current).toBe(before);
    });

    it('should handle updates across other useLocalStorage hooks', () => {
      const mockStorage = createMockStorage();
      const mockProvider = createMockProvider(mockStorage);

      const { result } = renderHook(() => {
        return useWebStorage(mockProvider, 'foo', { fallback: 'update me!' });
      });

      act(() => {
        const init = { detail: { value: 'did it!' } };
        const event = new CustomEvent('storage:mock-storage:update:foo', init);
        window.dispatchEvent(event);
      });

      expect(result.current.value).toBe('did it!');

      const onUpdateFoo = jest.fn();
      const onUpdateBar = jest.fn();
      window.addEventListener('storage:mock-storage:update:foo', onUpdateFoo);
      window.addEventListener('storage:mock-storage:update:bar', onUpdateBar);

      act(() => {
        result.current.setItem('notify me!');
      });

      expect(onUpdateFoo).toHaveBeenCalledTimes(1);
      expect(onUpdateFoo).toHaveBeenCalledWith(
        new CustomEvent('storage:update:foo', {
          detail: {
            value: 'notify me!',
          },
        }),
      );
    });

    it('should handle invalid updates attempts across other useLocalStorage hooks', () => {
      const mockStorage = createMockStorage();
      const mockProvider = createMockProvider(mockStorage);

      const { result } = renderHook(() => {
        return useWebStorage(mockProvider, 'foo', { fallback: 'update me!' });
      });

      act(() => {
        // Wrong event type:
        const event = new MouseEvent('storage:mock-storage:update:foo');
        window.dispatchEvent(event);
      });

      expect(result.current.value).toBe('update me!');

      act(() => {
        // Missing event detail:
        const event = new CustomEvent('storage:mock-storage:update:foo');
        window.dispatchEvent(event);
      });

      expect(result.current.value).toBe('update me!');

      act(() => {
        // Missing "value" in event detail:
        const init = { detail: {} };
        const event = new CustomEvent('storage:mock-storage:update:foo', init);
        window.dispatchEvent(event);
      });

      expect(result.current.value).toBe('update me!');
    });

    it('should handle access to a storage that is not availbale (null storage, due to possible strict security settings)', () => {
      const mockProvider: StorageProvider = {
        get name(): string {
          return 'mock-storage';
        },
        get storage(): Storage | null {
          return null;
        },
      };

      const { result } = renderHook(() => {
        return useWebStorage(mockProvider, 'foo');
      });

      expect(result.current)
        .toEqual({
          value: null,
          setItem: expect.any(Function),
          removeItem: expect.any(Function),
        });

      act(() => {
        result.current.setItem('bar');
      });

      expect(result.current)
        .toEqual({
          value: 'bar',
          setItem: expect.any(Function),
          removeItem: expect.any(Function),
        });

      act(() => {
        result.current.removeItem();
      });

      expect(result.current)
        .toEqual({
          value: null,
          setItem: expect.any(Function),
          removeItem: expect.any(Function),
        });
    });
  });

  describe('server side', () => {
    beforeEach(() => {
      mockCanUseDomGetter.mockReturnValue(false);
    });

    it('should return null on SSR', () => {
      const mockStorage = createMockStorage();
      mockStorage.setItem('foo', 'do not use me!');
      const mockProvider = createMockProvider(mockStorage);

      const { result } = renderHook(() => {
        return useWebStorage(mockProvider, 'foo');
      });

      expect(result.current)
        .toEqual({
          value: null,
          setItem: expect.any(Function),
          removeItem: expect.any(Function),
        });
    });

    it('should return fallback on SSR', () => {
      const mockStorage = createMockStorage();
      mockStorage.setItem('foo', 'do not use me!');
      const mockProvider = createMockProvider(mockStorage);

      const { result } = renderHook(() => {
        return useWebStorage(mockProvider, 'foo', { fallback: 'fallback' });
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
