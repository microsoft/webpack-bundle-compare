import * as React from 'react';
import { Stats, StatsModule } from 'webpack';
import {
  getConcatenationParent,
  getImportType,
  getReasons,
  replaceLoaderInIdentifier,
} from '../stat-reducers';
import { ButWaitTheresMore } from './but-wait-theres-more.component';
import styles from './imports-list.component.scss';
import { ModuleTypeBadge } from './panels/node-module-panel.component';
import { Placeholder } from './placeholder.component';

/**
 * Prints the list of modules that import the target modules.
 */
export const ImportsList: React.FC<{ targets: StatsModule[] }> = ({ targets }) =>
  targets.length === 0 ? (
    <Placeholder>This module is not imported in the lastest build.</Placeholder>
  ) : (
    <ButWaitTheresMore count={targets.length}>
      {i => {
        const target = targets[i];
        const reasons = getReasons(target);
        return (
          <div key={i} className={styles.importBox}>
            <div className={styles.title}>
              {target.name} in chunk{' '}
              {getConcatenationParent(target).chunks?.join(', ') ?? '<anonymous>'}
              <span style={{ flex: 1 }} />
              <ModuleTypeBadge type={getImportType(target)} />
            </div>
            <ButWaitTheresMore count={reasons.length}>
              {k => <ImportReason key={k} reason={reasons[k]} />}
            </ButWaitTheresMore>
          </div>
        );
      }}
    </ButWaitTheresMore>
  );

/**
 * Prints the list of issuers that import any of the target modules.
 */
export const IssuerTree: React.FC<{ targets: StatsModule[] }> = ({ targets }) =>
  targets.length === 0 ? (
    <Placeholder>This module is not imported in the lastest build.</Placeholder>
  ) : (
    <ButWaitTheresMore count={targets.length}>
      {i => {
        const target = targets[i];
        return (
          target.issuerPath && (
            <div key={i} className={styles.importBox}>
              <div className={styles.title}>
                {target.name} in chunk{' '}
                {getConcatenationParent(target).chunks?.join(', ') ?? '<anonymous>'}
                <span style={{ flex: 1 }} />
                <ModuleTypeBadge type={getImportType(target)} />
              </div>
              <ol className={styles.issuer}>
                {target.issuerPath.map((issuer, k) => (
                  <li key={k}>
                    <em>{k + 1}.</em> {issuer.name}
                  </li>
                ))}
              </ol>
            </div>
          )
        );
      }}
    </ButWaitTheresMore>
  );

const ImportReason: React.FC<{ reason: Stats.Reason }> = ({ reason }) => {
  const request = reason.userRequest
    ? replaceLoaderInIdentifier(reason.userRequest)
    : reason.moduleName;

  return (
    <div className={styles.reason}>
      <div className={styles.filename}>{reason.module}</div>
      <div className={styles.fakeLine}>
        <em>{reason.loc ? reason.loc.split(':')[0] : '?'}</em>
        {reason.type && reason.type.includes('harmony')
          ? `import "${request}"`
          : `require("${request}")`}
      </div>
    </div>
  );
};
