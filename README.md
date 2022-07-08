# Memoize Decorator

## Well, what is it?

A function to decorate methods and memoize their results to speed up further requests done with the same arguments.

## How to use it

```bash
npm i @merry-solutions/memoize-decorator
```

The decorator can accept the following payload:

```typescript
export interface MemoizePayload {
  // The function that will determine a unique id for the provided arguments set, you write iy
  extractUniqueId: (...args: any[]) => any;
  // Pass true if you want to use WeakMap, not that it requires keys to be objects
  doUseWeakMap?: boolean;
  // If regular map is used, you can set timeout to clear its contents, optional
  clearCacheTimeout?: number;
  // For debug purposes you can pass an exta function for logging all actions
  debugReporter?: (message: string, state?: Map<any, unknown> | WeakMap<object, unknown> | unknown) => void;
}
```

Now let's assume there's some class doing some calculations:

```typescript
interface CalculationPayload {
  id: number;
  someCountdownNumber: number;
}

class ObjectCountdownCalculator {
  public countdown({ someCountdownNumber }: CalculationPayload): number {
    let count = 0;
    while (count < someCountdownNumber) {
      count += 1;
    }
    return count;
  }
}
```

Assuming the unique arguments' identifier is the id of the passed object, we could decorate it:

```typescript
import { memoize } from '@merry-solutions/memoize-decorator';

class ObjectCountdownCalculator {
  @memoize({
    extractUniqueId: (a: CalculationPayload) => a.id,
  })
  public countdown({ someCountdownNumber }: CalculationPayload): number {
    let count = 0;
    while (count < someCountdownNumber) {
      count += 1;
    }
    return count;
  }
}
```

And poof! Our method is now leveraging the power of memoization to reduce execution time :)
