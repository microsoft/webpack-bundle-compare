import { createStandardAction, createAsyncAction, ActionType } from 'typesafe-actions';
import { IError } from '@mixer/retrieval';
import { Stats } from 'webpack';

/**
 * Requests analysis to run for a bundle.
 */
export const doAnalysis = createAsyncAction(
  'doAnalysisRequest',
  'doAnalysisSuccess',
  'doAnalysisFailure',
  'doAnalysisCancel',
)<{ url: string }, { url: string; data: Stats.ToJsonOutput }, IError & { url: string }, { url: string }>();

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
>;
