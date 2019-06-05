import * as filesize from 'filesize';
import * as React from 'react';
import { Stats } from 'webpack';
import { CounterPanel } from './panels/counter-panel.component';
import { PanelArrangement } from './panels/panel-arrangement.component';
import { color } from './util';
import { TotalNodeModuleSize, UniqueEntrypoints, DependentModules } from './hints/hints.component';

/**
 * Prints the list of modules that import the target modules.
 */
export const ImportsStatsRow: React.FC<{
  oldTargets: Stats.FnModules[];
  newTargets: Stats.FnModules[];
}> = ({ oldTargets, newTargets }) => (
  <PanelArrangement>
    <CounterPanel
      title="Total Size"
      hint={TotalNodeModuleSize}
      value={newTargets.reduce((acc, t) => acc + t.size, 0)}
      oldValue={oldTargets.reduce((acc, t) => acc + t.size, 0)}
      formatter={filesize}
    />
    <CounterPanel
      title="Unique Entrypoints"
      hint={UniqueEntrypoints}
      value={newTargets.length}
      oldValue={oldTargets.length}
      color={newTargets.length > 0 ? color.pink : undefined}
    />
    <CounterPanel
      title="Dependent Modules"
      hint={DependentModules}
      value={newTargets.reduce((acc, t) => acc + (t.reasons as any).length, 0)}
      oldValue={oldTargets.reduce((acc, t) => acc + (t.reasons as any).length, 0)}
    />
  </PanelArrangement>
);
