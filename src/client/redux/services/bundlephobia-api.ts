import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { HttpError } from './http-error';

export interface IDependencyStat {
  name: string;
  approximateSize: number;
}

/**
 * Stats returned from the bundlephobia API.
 */
export interface IBundlephobiaStats {
  dependencyCount: number;
  size: number;
  gzip: number;
  name: string;
  hasJSNext: boolean;
  hasJSModule: boolean;
  hasSideEffects: true;
  version: string;
  repository: string;
  topLevelExports?: string[];
  dependencySizes: IDependencyStat[];
}

/**
 * Type that gets bundle stats from the bundlephobia API.
 */
export interface IBundlephobiaApi {
  getBundleStats(bundle: string): Observable<IBundlephobiaStats>;
}

/**
 * Bundlephoba API implementation using browser fetch.
 */
export const fetchBundlephobiaApi: IBundlephobiaApi = {
  getBundleStats(bundle) {
    const url = `https://bundlephobia.com/api/size?package=${bundle}`;
    return from(
      fetch(url, {
        headers: {
          'X-Bundlephobia-User': '@mixer/webpack-bundle-compare',
        },
      }),
    ).pipe(
      mergeMap(async res => {
        if (res.ok) {
          return res.json();
        }

        throw new HttpError(url, {
          statusCode: res.status,
          serviceError: {
            errorCode: 0,
            errorMessage: await res.text(),
          },
        });
      }),
    );
  },
};
