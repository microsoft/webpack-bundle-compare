import * as React from 'react';
import { CounterPanel } from './stat-panels.component';
import { Stats } from 'webpack';
import { getTotalChunkSize, getNodeModuleCount } from '../stat-reducers';
import { ModulePlot } from './module-plot.component';

export const DashboardOverview: React.FC<{
  first: Stats.ToJsonOutput;
  last: Stats.ToJsonOutput;
}> = ({ first, last }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <div style={{ flexBasis: 300, marginRight: 16 }}>
        <CounterPanel
          title="Total Size"
          value={getTotalChunkSize(last)}
          oldValue={getTotalChunkSize(first)}
          filesize
        />
        <CounterPanel
          title="Node Modules"
          value={getNodeModuleCount(last)}
          oldValue={getNodeModuleCount(first)}
        />
      </div>
      <ModulePlot first={first} last={last} />
    </div>
  );
};
