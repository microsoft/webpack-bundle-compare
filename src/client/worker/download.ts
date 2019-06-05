import { from, Observable } from 'rxjs';
import { Stats } from 'webpack';
import { CompareAction, doAnalysis } from '../redux/actions';
import { ErrorCode } from '../redux/reducer';
import { Semaphore } from './semaphore';
import { inflate } from 'pako';
import { decode } from 'msgpack-lite';

const downloadSemaphore = new Semaphore(1);

export function download(url: string): Observable<CompareAction> {
  return from(
    (async () => {
      await downloadSemaphore.acquire().toPromise();

      try {
        const res = await fetch(url);
        return res.ok
          ? doAnalysis.success({ url, data: processDownload(await res.arrayBuffer()) })
          : doAnalysis.failure({
              url,
              statusCode: res.status,
              serviceError: {
                errorCode: ErrorCode.BundleRetrievalFailed,
                errorMessage: `Unexpected ${res.status} response: ${await res.text()}`,
              },
            });
      } catch (e) {
        console.log('failed', e.stack);
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

function processDownload(rawResponse: ArrayBuffer): Stats.ToJsonOutput {
  const asArray = new Uint8Array(rawResponse);
  const data = asArray[0] === 0x1f && asArray[1] === 0x8b ? inflate(asArray) : asArray;
  const stats: Stats.ToJsonOutput =
    data[0] === '{'.charCodeAt(0) ? JSON.parse(new TextDecoder().decode(data)) : decode(data);

  if (stats.modules) {
    stats.modules = stats.modules.filter(m => m.chunks.length !== 0);
  }

  return stats;
}
