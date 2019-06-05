import {
  error,
  idleRetrieval,
  IRetrievalError,
  Retrieval,
  RetrievalState,
  success,
  workingRetrival,
} from '@mixer/retrieval';
import { createSelector } from 'reselect';
import { getType } from 'typesafe-actions';
import { Stats } from 'webpack';
import { clearLoadedBundles, CompareAction, doAnalysis, fetchBundlephobiaData } from './actions';
import { IBundlephobiaStats } from './services/bundlephobia-api';

/**
 * Possible error codes.
 */
export const enum ErrorCode {
  Unknown,
  BundleRetrievalFailed,
}

export interface IAppState {
  /**
   * List of bundle loading states.
   */
  bundles: Readonly<{ [url: string]: Retrieval<Stats.ToJsonOutput> }>;

  /**
   * Mapping of bundlephobia dependency information.
   */
  bundlephobiaData: { [moduleName: string]: Retrieval<IBundlephobiaStats> };
}

declare const INITIAL_FILES: string[];

const initialState: IAppState = {
  bundles: INITIAL_FILES.reduce((acc, key) => ({ ...acc, [key]: idleRetrieval }), {}),
  bundlephobiaData: {},
};

export const reducer = (state = initialState, action: CompareAction): IAppState => {
  switch (action.type) {
    case getType(clearLoadedBundles):
      return {
        ...state,
        bundles: getBundleUrls(state).reduce((acc, url) => ({ ...acc, [url]: idleRetrieval }), {}),
      };
    case getType(doAnalysis.request):
      return {
        ...state,
        bundles: { ...state.bundles, [action.payload.url]: workingRetrival },
      };
    case getType(doAnalysis.success):
      return {
        ...state,
        bundles:
          getBundleData(action.payload.url)(state).state === RetrievalState.Retrieving
            ? { ...state.bundles, [action.payload.url]: success(action.payload.data) }
            : state.bundles,
      };
    case getType(doAnalysis.failure):
      return {
        ...state,
        bundles:
          getBundleData(action.payload.url)(state).state === RetrievalState.Retrieving
            ? { ...state.bundles, [action.payload.url]: error(action.payload) }
            : state.bundles,
      };
    case getType(doAnalysis.cancel):
      return {
        ...state,
        bundles: { ...state.bundles, [action.payload.url]: idleRetrieval },
      };
    case getType(fetchBundlephobiaData.request):
      return {
        ...state,
        bundlephobiaData: { ...state.bundlephobiaData, [action.payload.name]: workingRetrival },
      };
    case getType(fetchBundlephobiaData.success):
      return {
        ...state,
        bundlephobiaData: {
          ...state.bundlephobiaData,
          [action.payload.name]: success(action.payload),
        },
      };
    case getType(fetchBundlephobiaData.failure):
      return {
        ...state,
        bundlephobiaData: {
          ...state.bundlephobiaData,
          [action.payload.name]: error(action.payload),
        },
      };
    default:
      return state;
  }
};

/**
 * Gets the map of bundle data.
 */
export const getBundleMap = (state: IAppState) => state.bundles;

/**
 * Gets the data/state for a bundle.
 */
export const getBundleData = (url: string) => (state: IAppState) =>
  state.bundles[url] || idleRetrieval;

/**
 * Gets a list of bundle URLs.
 */
export const getKnownStats = createSelector(
  getBundleMap,
  map => {
    const output: Stats.ToJsonOutput[] = [];
    for (const key of Object.keys(map)) {
      const value = map[key];
      if (value.state === RetrievalState.Succeeded) {
        output.push(value.value);
      }
    }

    output.sort((a, b) => (a.builtAt || 0) - (b.builtAt || 0));
    return output;
  },
);

/**
 * Gets a list of bundle URLs.
 */
export const getBundleUrls = createSelector(
  getBundleMap,
  Object.keys,
);

/**
 * Gets a list of bundle URLs.
 */
export const getBundleErrors = createSelector(
  getBundleMap,
  (mapping): IRetrievalError[] =>
    Object.keys(mapping)
      .map(key => mapping[key] as IRetrievalError)
      .filter(value => value.state === RetrievalState.Errored),
);

/**
 * Map of retrieval states to the number of bundles in each state.
 */
export type BundleStateMap = { [r in RetrievalState]: number };

/**
 * Returns the number of bundles in each state.
 */
export const getGroupedBundleState = createSelector(
  getBundleMap,
  bundles => {
    const status: BundleStateMap = {
      [RetrievalState.Errored]: 0,
      [RetrievalState.Idle]: 0,
      [RetrievalState.Retrieving]: 0,
      [RetrievalState.Succeeded]: 0,
    };

    for (const key of Object.keys(bundles)) {
      status[bundles[key].state]++;
    }

    return status;
  },
);

/**
 * Retrieves bundlephovia data for the given module name.
 */
export const getBundlephobiaData = (state: IAppState, moduleName: string) =>
  state.bundlephobiaData[moduleName] || idleRetrieval;
