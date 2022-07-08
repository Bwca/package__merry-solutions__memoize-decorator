import { performance } from 'perf_hooks';

import { memoize } from './memoize.decorator';

describe('Tests for memoize decorator', () => {
  describe('Map caching with a single primitive argument', () => {
    class CountdownCalculator {
      @memoize({
        extractUniqueId: (i) => i,
      })
      public static decoratedCountdown(n: number): number {
        return CountdownCalculator.countdown(n);
      }

      public static nonDecoratedCountdown(n: number): number {
        return CountdownCalculator.countdown(n);
      }

      private static countdown(n: number): number {
        let count = 0;
        while (count < n) {
          count += 1;
        }
        return count;
      }
    }

    it('The decorated version of the countdown should be at least 5 times faster', () => {
      // Arrange
      const countdown = 500000000;
      const iterations = 5;

      // Act
      const decoratedVersionTime = checkRuntime(CountdownCalculator.decoratedCountdown, iterations, countdown);
      const nonDecoratedVersionTime = checkRuntime(CountdownCalculator.nonDecoratedCountdown, iterations, countdown);

      // Assert
      expect(Math.floor(nonDecoratedVersionTime / decoratedVersionTime)).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Map caching with an object', () => {
    interface CalculationPayload {
      id: number;
      n: number;
    }

    class ObjectCountdownCalculator {
      @memoize({
        extractUniqueId: (a) => a.id,
      })
      public static decoratedCountDownWithMap(a: CalculationPayload): number {
        return ObjectCountdownCalculator.countdown(a);
      }

      @memoize({
        extractUniqueId: (a) => a,
        doUseWeakMap: true,
      })
      public static decoratedCountdownWithWeakMap(a: CalculationPayload): number {
        return ObjectCountdownCalculator.countdown(a);
      }

      public static nonDecoratedCountDown(a: CalculationPayload): number {
        return ObjectCountdownCalculator.countdown(a);
      }

      private static countdown({ n }: CalculationPayload): number {
        let count = 0;
        while (count < n) {
          count += 1;
        }
        return count;
      }
    }

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('The decorated version of the countdown with weakmap should be at least 4 times faster', () => {
      // Arrange
      const countdown: CalculationPayload = {
        id: 1,
        n: 500000000,
      };
      const iterations = 5;

      // Act
      const decoratedVersionTime = checkRuntime(ObjectCountdownCalculator.decoratedCountdownWithWeakMap, iterations, countdown);
      const nonDecoratedVersionTime = checkRuntime(ObjectCountdownCalculator.nonDecoratedCountDown, iterations, countdown);

      // Assert
      expect(Math.floor(nonDecoratedVersionTime / decoratedVersionTime)).toBeGreaterThanOrEqual(4);
    });

    it('The decorated version of the countdown with regular map should be at least 5 times faster', () => {
      // Arrange
      const countdown: CalculationPayload = {
        id: 1,
        n: 500000000,
      };
      const iterations = 5;

      // Act
      const decoratedVersionTime = checkRuntime(ObjectCountdownCalculator.decoratedCountDownWithMap, iterations, countdown);
      const nonDecoratedVersionTime = checkRuntime(ObjectCountdownCalculator.nonDecoratedCountDown, iterations, countdown);

      // Assert
      expect(Math.floor(nonDecoratedVersionTime / decoratedVersionTime)).toBeGreaterThanOrEqual(5);
    });
  });
});

function checkRuntime<T extends (...args: any) => any, C>(fun: T, iterations: number, countdown: C): number {
  const start = performance.now();
  for (let x = 0; x++ <= iterations; ) {
    fun(countdown);
  }
  const end = performance.now();
  return end - start;
}
