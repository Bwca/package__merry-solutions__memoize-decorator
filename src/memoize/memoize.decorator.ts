import { MemoizeDecorator } from './models/decorator.model';
import { MemoizePayload } from './models/memoize-payload.model';

export function memoize(args: Omit<MemoizePayload, 'doUseWeakMap'>): MemoizeDecorator;
export function memoize(args: Omit<MemoizePayload, 'clearCacheTimeout'>): MemoizeDecorator;

export function memoize({ extractHash, clearCacheTimeout, doUseWeakMap }: MemoizePayload): MemoizeDecorator {
  return (target: unknown, propertyKey: string, descriptor: PropertyDescriptor): void => {
    let cacheTeardownTimer: ReturnType<typeof setTimeout>;

    let cache = initCache(doUseWeakMap);

    const startTeardownTimeout = !clearCacheTimeout
      ? null
      : () => {
          if (cacheTeardownTimer) {
            clearTimeout(cacheTeardownTimer);
          }
          cacheTeardownTimer = setTimeout(() => {
            cache = initCache(doUseWeakMap);
          }, clearCacheTimeout);
        };

    const originalMethod = descriptor.value;

    descriptor.value = function (...args: unknown[]) {
      startTeardownTimeout?.();

      const hash: any = extractHash(...args);

      if (cache.has(hash)) {
        return cache.get(hash);
      }

      const result = originalMethod.apply(this, args);
      cache.set(hash, result);

      return result;
    };
  };
}

function initCache(doUseWeakMap?: boolean) {
  return doUseWeakMap ? new WeakMap<object, unknown>() : new Map<any, unknown>();
}
