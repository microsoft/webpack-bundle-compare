import * as cytoscape from 'cytoscape';
import * as React from 'react';
import { Redirect } from 'react-router';
import { Stats } from 'webpack';
import {
  compareAllModules,
  getDirectImportsOfNodeModule,
  normalizeIdentifier,
} from '../../stat-reducers';
import { color } from '../util';
import { BaseGraph, expandModuleComparison } from './base-graph.component';

interface IProps {
  previous: Stats.ToJsonOutput;
  stats: Stats.ToJsonOutput;
  name: string;
  chunkId?: number;
}

interface IState {
  nodes: cytoscape.NodeDefinition[];
  edges: cytoscape.EdgeDefinition[];
  entries: string[];
  redirect?: string;
}

export class DependentGraph extends React.PureComponent<IProps, IState> {
  public state: IState = { redirect: undefined, ...this.buildData() };

  public render() {
    return this.state.redirect ? (
      <Redirect to={this.state.redirect} push={true} />
    ) : (
      <BaseGraph
        edges={this.state.edges}
        nodes={this.state.nodes}
        rootNode={this.state.entries}
        width="100%"
        height={window.innerHeight * 0.9}
        onClick={this.onClick}
      />
    );
  }

  private buildData() {
    const directImports = getDirectImportsOfNodeModule(this.props.previous, this.props.name);
    const comparisons = compareAllModules(
      this.props.previous,
      this.props.stats,
      this.props.chunkId,
    );

    const { nodes, edges } = expandModuleComparison(
      comparisons,
      directImports.map(imp => comparisons[normalizeIdentifier(imp.identifier)]).filter(ok => !!ok),
    );

    for (const edge of edges) {
      [edge.data.source, edge.data.target] = [edge.data.target, edge.data.source];
    }

    nodes.push({
      data: {
        id: 'index',
        label: this.props.name,
        fontColor: '#fff',
        bgColor: color.blue,
        width: 20,
        height: 20,
      },
    });

    for (const direct of directImports) {
      edges.push({
        data: {
          id: `${direct.identifier}toIndex`,
          source: direct.identifier,
          target: 'index',
        },
      });
    }

    return { nodes, edges, entries: ['index'] };
  }

  private readonly onClick = (nodeId: string) =>
    this.setState({ redirect: `/dashboard/chunk/${nodeId}` });
}
