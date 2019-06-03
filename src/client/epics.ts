import { Epic as PlainEpic, combineEpics } from 'redux-observable';
import { CompareAction, loadAllUrls, doAnalysis } from './actions';
import { IAppState } from './reducer';
import { filter, mergeMap } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';

type Epic = PlainEpic<CompareAction, CompareAction, IAppState, {}>;

const loadAllUrlsEpic: Epic = actions =>
  actions.pipe(
    filter(isActionOf(loadAllUrls)),
    mergeMap(action => action.payload.urls.map(url => doAnalysis.request({ url }))),
  );

export const epics = combineEpics(loadAllUrlsEpic);
