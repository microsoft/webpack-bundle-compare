import * as React from 'react';
import { Stats } from 'webpack';
import {
  getConcatenationParent,
  getImportType,
  getReasons,
  replaceLoaderInIdentifier,
} from '../stat-reducers';
import * as styles from './imports-list.component.scss';
import { ModuleTypeBadge } from './panels/node-module-panel.component';
import { Placeholder } from './placeholder.component';

/**
 * Prints the list of modules that import the target modules.
 */
export const ImportsList: React.FC<{ targets: Stats.FnModules[] }> = ({ targets }) =>
  targets.length === 0 ? (
    <Placeholder>This module is not imported in the lastest build.</Placeholder>
  ) : (
    <>
      {targets.map((target, i) => (
        <div key={i} className={styles.importBox}>
          <div className={styles.title}>
            {target.name} in chunk {getConcatenationParent(target).chunks.join(', ')}
            <span style={{ flex: 1 }} />
            <ModuleTypeBadge type={getImportType(target)} />
          </div>
          {getReasons(target).map((reason, k) => (
            <ImportReason key={k} reason={reason} />
          ))}
        </div>
      ))}
    </>
  );

/**
 * Prints the list of issuers that import any of the target modules.
 */
export const IssuerTree: React.FC<{ targets: Stats.FnModules[] }> = ({ targets }) =>
  targets.length === 0 ? (
    <Placeholder>This module is not imported in the lastest build.</Placeholder>
  ) : (
    <>
      {targets.map(
        (target, i) =>
          target.issuerPath && (
            <div key={i} className={styles.importBox}>
              <div className={styles.title}>
                {target.name} in chunk {getConcatenationParent(target).chunks.join(', ')}
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
          ),
      )}
    </>
  );

const ImportReason: React.FC<{ reason: Stats.Reason }> = ({ reason }) => {
  const request = replaceLoaderInIdentifier(reason.userRequest);
  return (
    <div className={styles.reason}>
      <div className={styles.filename}>{reason.module}</div>
      <div className={styles.fakeLine}>
        <em>{reason.loc.split(':')[0]}</em>
        {reason.type && reason.type.includes('harmony')
          ? `import "${request}"`
          : `require("${request}")`}
      </div>
    </div>
  );
};
