import { Base64 } from 'js-base64';
import { combineEpics, Epic as PlainEpic } from 'redux-observable';
import { EMPTY, of } from 'rxjs';
import { catchError, delay, filter, map, mergeMap } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';
import { CompareAction, doAnalysis, fetchBundlephobiaData, loadAllUrls } from './actions';
import { IAppState } from './reducer';
import { IBundlephobiaApi } from './services/bundlephobia-api';
import { HttpError } from './services/http-error';

export interface IServices {
  bundlephobia: IBundlephobiaApi;
}

type Epic = PlainEpic<CompareAction, CompareAction, IAppState, IServices>;

const seedFromQueryStringEpic: Epic = () => {
  const prefix = 'urls=';
  const query = window.location.search;
  const index = query.indexOf(prefix);
  if (index === -1) {
    return EMPTY;
  }

  return of(
    loadAllUrls({
      urls: query
        .slice(index + prefix.length)
        .split(',')
        .map(Base64.decode),
    }),
  ).pipe(delay(100));
};

const loadAllUrlsEpic: Epic = actions =>
  actions.pipe(
    filter(isActionOf(loadAllUrls)),
    mergeMap(action => action.payload.urls.map(url => doAnalysis.request({ url }))),
  );

const loadBundlephobiaInfoEpic: Epic = (actions, _, { bundlephobia }) =>
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

export const epics = combineEpics(
  loadAllUrlsEpic,
  loadBundlephobiaInfoEpic,
  seedFromQueryStringEpic,
);
