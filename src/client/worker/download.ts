import { decode } from 'msgpack-lite';
import { inflate } from 'pako';
import { from, Observable } from 'rxjs';
import { Stats } from 'webpack';
import { CompareAction, doAnalysis, ILoadableResource } from '../redux/actions';
import { ErrorCode } from '../redux/reducer';
import { Semaphore } from './semaphore';

const downloadSemaphore = new Semaphore(1);

export function download(resource: ILoadableResource): Observable<CompareAction> {
  return from(
    (async () => {
      await downloadSemaphore.acquire().toPromise();

      try {
        let buffer: ArrayBuffer;

        if (resource.file) {
          const reader = new FileReaderSync();
          buffer = reader.readAsArrayBuffer(resource.file);
        } else {
          const res = await fetch(resource.url);
          if (!res.ok) {
            return doAnalysis.failure({
              resource,
              statusCode: res.status,
              serviceError: {
                errorCode: ErrorCode.BundleRetrievalFailed,
                errorMessage: `Unexpected ${res.status} response: ${await res.text()}`,
              },
            });
          }

          buffer = await res.arrayBuffer();
        }

        return doAnalysis.success({ resource, data: processDownload(buffer) });
      } catch (e) {
        return doAnalysis.failure({
          resource,
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
