import * as cytoscape from 'cytoscape';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { Stats } from 'webpack';
import { BaseGraph, fileSizeNode } from './base-graph.component';

interface IProps {
  previous: Stats.ToJsonOutput;
  stats: Stats.ToJsonOutput;
  maxBubbleArea?: number;
  minBubbleArea?: number;
}

interface IState {
  nodes: cytoscape.NodeDefinition[];
  edges: cytoscape.EdgeDefinition[];
  entries: string[];
}

export const ChunkGraph = withRouter(
  class extends React.PureComponent<IProps & RouteComponentProps<{}>, IState> {
    public state: IState = this.buildData();

    public render() {
      return (
        <BaseGraph
          edges={this.state.edges}
          nodes={this.state.nodes}
          rootNode={this.state.entries}
          width="100%"
          height={0.9 * window.innerHeight}
          onClick={this.onClick}
        />
      );
    }

    private buildData() {
      const { stats, maxBubbleArea = 150, minBubbleArea = 30 } = this.props;
      const chunks = stats.chunks!;
      const maxSize = chunks.reduce((max, c) => Math.max(max, c.size), 0);
      const entries: string[] = [];

      const nodes: cytoscape.ElementDefinition[] = chunks.map(chunk => {
        if (chunk.entry) {
          entries.push(String(chunk.id));
        }

        const weight = chunk.size / maxSize;
        const area = Math.max(minBubbleArea, maxBubbleArea * weight);
        const previous = this.props.previous.chunks!.find(c => c.id === chunk.id);

        return {
          data: fileSizeNode({
            id: String(chunk.id),
            chunkId: chunk.id,
            shortLabel: '' + chunk.id,
            label: `Chunk ${chunk.id}`,
            fromSize: previous ? previous.size : 0,
            toSize: chunk.size,
            area,
          }),
        };
      });

      const edges: cytoscape.EdgeDefinition[] = [];

      for (const chunk of chunks) {
        for (const parent of chunk.parents) {
          edges.push({
            data: {
              id: `edge${parent}to${chunk.id}`,
              source: String(chunk.id),
              target: String(parent),
            },
          });
        }
      }

      return { nodes, edges, entries };
    }

    private readonly onClick = (nodeId: string) =>
      this.props.history.push(`/dashboard/chunk/${nodeId}`);
  },
);
