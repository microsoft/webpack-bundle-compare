import { combineEpics, Epic as PlainEpic } from 'redux-observable';
import { of } from 'rxjs';
import { catchError, filter, map, mergeMap } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';
import { CompareAction, doAnalysis, fetchBundlephobiaData, loadAllUrls } from './actions';
import { IAppState } from './reducer';
import { IBundlephobiaApi } from './services/bundlephobia-api';
import { HttpError } from './services/http-error';

export interface IServices {
  bundlephobia: IBundlephobiaApi;
}

type Epic = PlainEpic<CompareAction, CompareAction, IAppState, IServices>;

const loadAllUrlsEpic: Epic = actions =>
  actions.pipe(
    filter(isActionOf(loadAllUrls)),
    mergeMap(action => action.payload.urls.map(url => doAnalysis.request({ url }))),
  );

const loadBundlephobiaInfo: Epic = (actions, _, { bundlephobia }) =>
  actions.pipe(
    filter(isActionOf(fetchBundlephobiaData.request)),
    mergeMap(action =>
      bundlephobia.getBundleStats(action.payload.name).pipe(
        map(fetchBundlephobiaData.success),
        catchError((err: HttpError) =>
          of(fetchBundlephobiaData.failure({ ...err.retrievalError, name: action.payload.name })),
        ),
      ),
    ),
  );

export const epics = combineEpics(loadAllUrlsEpic, loadBundlephobiaInfo);
