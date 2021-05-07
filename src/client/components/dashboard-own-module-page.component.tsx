import * as filesize from 'filesize';
import * as React from 'react';
import { StatsCompilation } from 'webpack';
import {
  getImportsOfName,
  getWebpackModulesMap,
  replaceLoaderInIdentifier,
} from '../stat-reducers';
import { GenericDependentGraph } from './graphs/dependent-graph.component';
import { DependentModules } from './hints/hints.component';
import { ImportsList, IssuerTree } from './imports-list.component';
import { CounterPanel } from './panels/counter-panel.component';
import { PanelArrangement } from './panels/panel-arrangement.component';

export const DashboardOwnModulePage: React.FC<{
  name: string;
  first: StatsCompilation;
  last: StatsCompilation;
}> = ({ first, last, name }) => {
  const firstRoot = getWebpackModulesMap(first)[name];
  const lastRoot = getWebpackModulesMap(last)[name];
  const anyRoot = lastRoot || firstRoot;
  if (!anyRoot) {
    return null;
  }

  const firstImports = getImportsOfName(first, name);
  const lastImports = getImportsOfName(last, name);

  return (
    <>
      <div className="row" style={{ padding: 1 }}>
        <div className="col-xs-12 col-sm-8">
          <PanelArrangement>
            <CounterPanel
              title="Total Size"
              value={lastRoot?.size ?? 0}
              oldValue={firstRoot ? firstRoot.size : 0}
              formatter={filesize}
            />
            <CounterPanel
              title="Dependent Modules"
              hint={DependentModules}
              value={lastImports.length}
              oldValue={firstImports.length}
            />
            <CounterPanel
              title="Exports Used"
              value={lastRoot && lastRoot.usedExports ? (lastRoot.usedExports as any).length : 0}
              oldValue={
                firstRoot && lastRoot.usedExports ? (firstRoot.usedExports as any).length : 0
              }
            />
          </PanelArrangement>

          <h2>Imports of "{replaceLoaderInIdentifier(anyRoot.name)}"</h2>
          <ImportsList targets={lastImports} />
        </div>
        <div className="col-xs-12 col-sm-4">
          <h2>
            Issuer Tree
            <small>The shortest from the entrypoint to this module</small>
          </h2>
          <IssuerTree targets={lastImports} />
        </div>
      </div>

      <h2>
        Import Tree<small>A graph of all files that depend on the module.</small>
      </h2>
      <GenericDependentGraph previous={first} stats={last} root={anyRoot} />
    </>
  );
};
