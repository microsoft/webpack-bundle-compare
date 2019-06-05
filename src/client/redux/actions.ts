import { IError } from '@mixer/retrieval';
import { ActionType, createAsyncAction, createStandardAction } from 'typesafe-actions';
import { Stats } from 'webpack';
import { IBundlephobiaStats } from './services/bundlephobia-api';

/**
 * Requests analysis to run for a bundle.
 */
export const doAnalysis = createAsyncAction(
  'doAnalysisRequest',
  'doAnalysisSuccess',
  'doAnalysisFailure',
  'doAnalysisCancel',
)<
  { url: string },
  { url: string; data: Stats.ToJsonOutput },
  IError & { url: string },
  { url: string }
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
export const loadAllUrls = createStandardAction('loadAllUrls')<{ urls: string[] }>();

/**
 * Clears loaded bundles.
 */
export const clearLoadedBundles = createStandardAction('clearLoadedBundles')();

/**
 * Indicates that a webworker errored.
 */
export const webworkerErrored = createStandardAction('webworkerErrored')<IError>();

export type CompareAction = ActionType<
  | typeof doAnalysis
  | typeof webworkerErrored
  | typeof loadAllUrls
  | typeof clearLoadedBundles
  | typeof fetchBundlephobiaData
>;
