import * as cytoscape from 'cytoscape';
import { Base64 } from 'js-base64';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { Stats } from 'webpack';
import { compareAllModules, getNodeModuleFromIdentifier } from '../../stat-reducers';
import { Placeholder } from '../placeholder.component';
import { linkToModule, linkToNodeModule } from '../util';
import { BaseGraph, expandModuleComparison } from './base-graph.component';

interface IProps {
  previous: Stats.ToJsonOutput;
  stats: Stats.ToJsonOutput;
  chunkId: number;
}

interface IState {
  nodes: cytoscape.NodeDefinition[];
  edges: cytoscape.EdgeDefinition[];
  entries: string[];
}

export const ChangedModuleGraph = withRouter(
  class extends React.PureComponent<IProps & RouteComponentProps<{}>, IState> {
    public state: IState = this.buildData();

    public render() {
      return this.state.nodes.length ? (
        <BaseGraph
          edges={this.state.edges}
          nodes={this.state.nodes}
          rootNode={this.state.entries}
          width="100%"
          height={window.innerHeight * 0.9}
          onClick={this.onClick}
        />
      ) : (
        <Placeholder>No changes made in this bundle.</Placeholder>
      );
    }

    private buildData() {
      const comparisons = compareAllModules(
        this.props.previous,
        this.props.stats,
        this.props.chunkId,
      );
      const allComparisons = Object.values(comparisons);

      return expandModuleComparison(
        comparisons,
        Object.values(allComparisons).filter(c => c.toSize !== c.fromSize),
      );
    }

    private readonly onClick = (encodedId: string) => {
      const nodeId = Base64.decode(encodedId);
      const nodeModule = getNodeModuleFromIdentifier(nodeId);
      this.props.history.push(nodeModule ? linkToNodeModule(nodeModule) : linkToModule(nodeId));
    };
  },
);
