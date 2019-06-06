import * as cytoscape from 'cytoscape';
import * as React from 'react';
import { Redirect } from 'react-router';
import { Stats } from 'webpack';
import { compareAllModules } from '../../stat-reducers';
import { Placeholder } from '../placeholder.component';
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
  redirect?: string;
}

export class ChangedModuleGraph extends React.PureComponent<IProps, IState> {
  public state: IState = { redirect: undefined, ...this.buildData() };

  public render() {
    return this.state.redirect ? (
      <Redirect to={this.state.redirect} push={true} />
    ) : this.state.nodes.length ? (
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

  private readonly onClick = (nodeId: string) =>
    this.setState({ redirect: `/dashboard/chunk/${nodeId}` });
}
