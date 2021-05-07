import { IError } from '@mixer/retrieval';
import { ActionType, createAction, createAsyncAction } from 'typesafe-actions';
import { StatsCompilation } from 'webpack';
import { IBundlephobiaStats } from './services/bundlephobia-api';

export interface ILoadableResource {
  url: string;
  file?: File;
}

/**
 * Requests analysis to run for a bundle.
 */
export const doAnalysis = createAsyncAction(
  'doAnalysisRequest',
  'doAnalysisSuccess',
  'doAnalysisFailure',
  'doAnalysisCancel',
)<
  { resource: ILoadableResource },
  { resource: ILoadableResource; data: StatsCompilation },
  IError & { resource: ILoadableResource },
  { resource: ILoadableResource }
>();

/**
 * Requests analysis to run for a bundle.
 */
export const fetchBundlephobiaData = createAsyncAction(
  'getBundlephobiaRequest',
  'getBundlephobiaSuccess',
  'getBundlephobiaFailure',
)<{ name: string }, IBundlephobiaStats, IError & { name: string }>();

/**
 * Loads bundles for all the requested urls.
 */
export const loadAllUrls = createAction('loadAllUrls')<{
  resources: ILoadableResource[];
}>();

/**
 * Clears loaded bundles.
 */
export const clearLoadedBundles = createAction('clearLoadedBundles')();

/**
 * Indicates that a webworker errored.
 */
export const webworkerErrored = createAction('webworkerErrored')<IError>();

export type CompareAction = ActionType<
  | typeof doAnalysis
  | typeof webworkerErrored
  | typeof loadAllUrls
  | typeof clearLoadedBundles
  | typeof fetchBundlephobiaData
>;
