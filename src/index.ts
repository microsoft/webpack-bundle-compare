import { Base64 } from 'js-base64';

export * from './plugin';

/**
 * A link to the bundle comparison tool preloaded to pull the stats from
 * the provided URLs.
 */
export function getComparisonAddress(
  bundleStatUrls: string[],
  toolUrl: string = 'https://webpackbundlecomparison.z5.web.core.windows.net',
) {
  return `${toolUrl}?urls=${bundleStatUrls.map(Base64.encodeURI).join(',')}`;
}
