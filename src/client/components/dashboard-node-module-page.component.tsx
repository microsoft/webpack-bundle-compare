import * as React from 'react';
import { Stats } from 'webpack';
import { getDirectImportsOfNodeModule } from '../stat-reducers';
import { BundlephobiaStats } from './bundlephobia-stats.component';
import { NodeModuleDependentGraph } from './graphs/dependent-graph.component';
import { ImportsList, IssuerTree } from './imports-list.component';
import { ImportsStatsRow } from './imports-stats-row.component';

export const DashboardNodeModulePage: React.FC<{
  name: string;
  first: Stats.ToJsonOutput;
  last: Stats.ToJsonOutput;
}> = ({ first, last, name }) => {
  const firstImports = getDirectImportsOfNodeModule(first, name);
  const lastImports = getDirectImportsOfNodeModule(last, name);
  return (
    <>
      <div className="row" style={{ padding: 1 }}>
        <div className="col-xs-12 col-sm-8">
          <ImportsStatsRow oldTargets={firstImports} newTargets={lastImports} />

          <h2>Imports of "{name}"</h2>
          <ImportsList targets={lastImports} />
        </div>
        <div className="col-xs-12 col-sm-4">
          <h2>Bundlephobia Stats</h2>
          <BundlephobiaStats name={name} />

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
      <NodeModuleDependentGraph previous={first} stats={last} name={name} />
    </>
  );
};
