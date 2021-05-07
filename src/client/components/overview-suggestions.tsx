import * as filesize from 'filesize';
import * as React from 'react';
import { IoIosInformationCircleOutline, IoIosThumbsUp } from 'react-icons/io';
import { StatsCompilation } from 'webpack';
import {
  getEntryChunkSize,
  getNodeModuleSize,
  getTotalChunkSize,
  getTreeShakablePercent,
} from '../stat-reducers';
import styles from './overview-suggestions.component.scss';
import { classes, formatPercent } from './util';

interface IProps {
  first: StatsCompilation;
  last: StatsCompilation;
}

const epsilon = 1024 * 2;

function nodeModuleSizeTip(first: StatsCompilation, last: StatsCompilation) {
  const firstNodeModuleSize = getNodeModuleSize(first);
  const lastNodeModuleSize = getNodeModuleSize(last);
  if (lastNodeModuleSize > firstNodeModuleSize + epsilon) {
    return (
      <div className={classes(styles.tip, styles.suggestion)}>
        <IoIosInformationCircleOutline className={styles.icon} />
        Try to use smaller node modules, or eliminate ones you don't need.{' '}
        <a href="https://bundlephobia.com/" target="_blank" rel="nofollow noopener">
          BundlePhobia
        </a>{' '}
        can help you find smaller modules.
        <small>
          The size of your node modules grew from {filesize(firstNodeModuleSize)} to{' '}
          {filesize(lastNodeModuleSize)}
        </small>
      </div>
    );
  }

  if (lastNodeModuleSize < firstNodeModuleSize - epsilon) {
    return (
      <div className={classes(styles.tip, styles.awesome)}>
        You dropped {filesize(firstNodeModuleSize - lastNodeModuleSize)} from your node modules
        size!
        <small>Way to go!</small>
      </div>
    );
  }

  return null;
}

function entrypointTip(last: StatsCompilation) {
  const totalSize = getTotalChunkSize(last);
  const entrySize = getEntryChunkSize(last);
  const isMajority = entrySize > totalSize / 2;
  if ((isMajority || entrySize > 1024 * 512) && totalSize > 1024 * 128) {
    return (
      <div className={classes(styles.tip, styles.suggestion)}>
        <IoIosInformationCircleOutline className={styles.icon} />
        Your entrypoint size is pretty big. Investigate code splitting and lazy loading to import
        only the code you need.
        <small>
          Your entrypoint{' '}
          {isMajority
            ? `contains the majority (${filesize(entrySize)}) of your code.`
            : `is fairly large (${filesize(entrySize)}).`}
        </small>
      </div>
    );
  } else if (entrySize < totalSize / 5) {
    return (
      <div className={classes(styles.tip, styles.awesome)}>
        <IoIosThumbsUp className={styles.icon} />
        Your code is split up well, your entrypoint is {formatPercent(entrySize / totalSize)} of
        your total code size.
        <small>Way to go!</small>
      </div>
    );
  }

  return null;
}

function treeShakeTip(last: StatsCompilation) {
  const percent = getTreeShakablePercent(last);
  if (percent > 0.8) {
    return;
  }

  return (
    <div className={classes(styles.tip, styles.suggestion)}>
      <IoIosInformationCircleOutline className={styles.icon} />
      Some of your modules aren't tree shaken. Choose ones that can be tree-shaken to help reduce
      your bundle size.
      <small>{formatPercent(1 - percent)} of your dependencies aren't tree shaken.</small>
    </div>
  );
}

export const OverviewSuggestions: React.FC<IProps> = ({ first, last }) => {
  return (
    <>
      {nodeModuleSizeTip(first, last)}
      {entrypointTip(last)}
      {treeShakeTip(last)}
    </>
  );
};
