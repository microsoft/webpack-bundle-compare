declare module 'bfj' {
  export interface IBfjOptions {
    space?: string | number;
    promises?: 'ignore';
    buffers?: 'ignore';
    maps?: 'ignore';
    iterables?: 'ignore';
    circular?: 'ignore';
    bufferLength?: number;
    highWaterMark?: number;
    yieldRate?: number;
    Promise?: PromiseConstructorLike;
  }

  export function streamify(data: any, options?: IBfjOptions): NodeJS.ReadableStream;
}
