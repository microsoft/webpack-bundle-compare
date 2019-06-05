import { Observable, of, Subject } from 'rxjs';
import { filter, take } from 'rxjs/operators';

/**
 * Semaphore class similar to C#'s SemaphoreSlim.
 */
export class Semaphore {
  private readonly changed = new Subject<void>();
  constructor(private currentCount: number, private readonly maxCount: number = Infinity) {}

  /**
   * Releases the held semaphore, with an optional count.
   */
  public release(count: number = 1): void {
    this.currentCount = Math.min(this.currentCount + count, this.maxCount);
    this.changed.next();
  }

  /**
   * Acquires the given number of requests from the semaphore.
   */
  public acquire(count: number = 1): Observable<void> {
    if (this.currentCount >= count) {
      this.currentCount -= count;
      return of(undefined);
    }

    return this.changed.pipe(
      filter(() => {
        if (this.currentCount >= count) {
          this.currentCount -= count;
          return true;
        }

        return false;
      }),
      take(1),
    );
  }
}
