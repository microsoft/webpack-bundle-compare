import { Observable, from } from 'rxjs';
import { CompareAction, doAnalysis } from '../actions';
import { ErrorCode } from '../reducer';
import { Semaphore } from './semaphore';

const downloadSemaphore = new Semaphore(1);

export function download(url: string): Observable<CompareAction> {
  return from(
    (async () => {
      await downloadSemaphore.acquire().toPromise();

      try {
        const res = await fetch(url);
        return res.ok
          ? doAnalysis.success({ url, data: await res.json() })
          : doAnalysis.failure({
              url,
              statusCode: res.status,
              serviceError: {
                errorCode: ErrorCode.BundleRetrievalFailed,
                errorMessage: `Unexpected ${res.status} response: ${await res.text()}`,
              },
            });
      } catch (e) {
        return doAnalysis.failure({
          url,
          statusCode: 500,
          serviceError: {
            errorCode: ErrorCode.BundleRetrievalFailed,
            errorMessage: e.stack || e.message,
          },
        });
      } finally {
        downloadSemaphore.release();
      }
    })(),
  );
}
