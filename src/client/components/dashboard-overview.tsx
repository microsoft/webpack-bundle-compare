import * as filesize from 'filesize';
import * as React from 'react';
import { Stats } from 'webpack';
import {
  getAverageChunkSize,
  getEntryChunkSize,
  getNodeModuleCount,
  getNodeModuleSize,
  getTotalChunkSize,
  getTotalModuleCount,
  getTreeShakablePercent,
} from '../stat-reducers';
import { ModuleTable } from './module-table.component';
import { OverviewSuggestions } from './overview-suggestions';
import { CounterPanel } from './panels/counter-panel.component';
import { PanelArrangement } from './panels/panel-arrangement.component';
import { formatDuration, formatPercent } from './util';

import { ChunkGraph } from './graphs/chunk-graph.component';
import {
  AverageChunkSize,
  TotalModules,
  TreeShakeHint,
  WhatIsAnEntrypoint,
} from './hints/hints.component';

export const DashboardOverview: React.FC<{
  first: Stats.ToJsonOutput;
  last: Stats.ToJsonOutput;
}> = ({ first, last }) => {
  return (
    <>
      <div className="row" style={{ padding: 1 }}>
        <div className="col-xs-12 col-sm-6">
          <h2>Suggestions</h2>
          <OverviewSuggestions first={first} last={last} />

          <h2 style={{ marginTop: 64 }}>Stats</h2>
          <PanelArrangement>
            <CounterPanel
              title="Total Size"
              value={getTotalChunkSize(last)}
              oldValue={getTotalChunkSize(first)}
              formatter={filesize}
            />
            <CounterPanel
              title="Download Time (3 Mbps)"
              value={(getTotalChunkSize(last) / (3500 * 128)) * 1000}
              oldValue={(getTotalChunkSize(first) / (3500 * 128)) * 1000}
              formatter={formatDuration}
            />
            <CounterPanel
              title="Avg. Chunk Size"
              value={getAverageChunkSize(last)}
              oldValue={getAverageChunkSize(first)}
              hint={AverageChunkSize}
              formatter={filesize}
            />
            <CounterPanel
              title="Entrypoint Size"
              hint={WhatIsAnEntrypoint}
              value={getEntryChunkSize(last)}
              oldValue={getEntryChunkSize(first)}
              formatter={filesize}
            />
            <CounterPanel
              title="Total Modules"
              hint={TotalModules}
              value={getTotalModuleCount(last)}
              oldValue={getTotalModuleCount(first)}
            />
            <CounterPanel
              title="Node Module Size"
              value={getNodeModuleSize(last)}
              oldValue={getNodeModuleSize(first)}
              formatter={filesize}
            />
            <CounterPanel
              title="Tree-Shaken Node Modules"
              hint={TreeShakeHint}
              value={getTreeShakablePercent(last)}
              oldValue={getTreeShakablePercent(first)}
              formatter={formatPercent}
            />
            <CounterPanel
              title="Node Module Count"
              value={getNodeModuleCount(last)}
              oldValue={getNodeModuleCount(first)}
            />
            <CounterPanel
              title="Build Time"
              value={last.time!}
              oldValue={first.time!}
              formatter={formatDuration}
            />
          </PanelArrangement>
        </div>
        <div className="col-xs-12 col-sm-6">
          <h2>Module List</h2>
          <ModuleTable first={first} last={last} />
        </div>
      </div>
      <h2>
        Chunk Graph
        <small>
          Larger chunks are shown in red, smaller ones in green. Click on a chunk to drill down.
        </small>
      </h2>
      <ChunkGraph stats={last} previous={first} />
    </>
  );
};
