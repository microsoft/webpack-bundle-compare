import * as React from 'react';
import { Stats } from 'webpack';
import { getImportType, replaceLoaderInIdentifier } from '../stat-reducers';
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
      {targets.map(target => (
        <div key={target.identifier} className={styles.importBox}>
          <div className={styles.title}>
            {target.name}
            <span style={{ flex: 1 }} />
            <ModuleTypeBadge type={getImportType(target)} />
          </div>
          {(target.reasons as any).map((reason: Stats.Reason, i: number) => (
            <ImportReason key={i} reason={reason} />
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
        target =>
          target.issuerPath && (
            <div key={target.identifier} className={styles.importBox}>
              <div className={styles.title}>
                {target.name}
                <span style={{ flex: 1 }} />
                <ModuleTypeBadge type={getImportType(target)} />
              </div>
              <ol className={styles.issuer}>
                {target.issuerPath.map((issuer, i) => (
                  <li key={i}>
                    <em>{i + 1}.</em> {issuer.name}
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
        {reason.type.includes('harmony') ? `import "${request}"` : `require("${request}")`}
      </div>
    </div>
  );
};
