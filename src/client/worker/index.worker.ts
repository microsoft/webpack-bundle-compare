import { EMPTY, Observable } from 'rxjs';
import { getType } from 'typesafe-actions';
import { CompareAction, doAnalysis, webworkerErrored } from '../redux/actions';
import { ErrorCode } from '../redux/reducer';
import { download } from './download';

const ctx: Worker = self as any;
const mapAction = (action: CompareAction): Observable<CompareAction> => {
  switch (action.type) {
    case getType(doAnalysis.request):
      return download(action.payload.url);
    default:
      return EMPTY;
  }
};

ctx.onmessage = event => {
  mapAction(event.data).subscribe(
    action => ctx.postMessage(action),
    err =>
      ctx.postMessage(
        webworkerErrored({
          statusCode: 500,
          serviceError: {
            errorCode: ErrorCode.Unknown,
            errorMessage: err.stack || err.message || String(err),
          },
        }),
      ),
  );
};
