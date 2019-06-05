import * as cytoscape from 'cytoscape';
import * as filesize from 'filesize';
import * as React from 'react';
import { Stats } from 'webpack';
import { IWebpackModuleComparisonOutput, normalizeIdentifier } from '../../stat-reducers';
import { formatPercentageDifference } from '../util';

// tslint:disable-next-line
cytoscape.use(require('cytoscape-fcose'));

interface IProps {
  edges: cytoscape.EdgeDefinition[];
  nodes: cytoscape.NodeDefinition[];
  rootNode?: string | string[];
  width: string | number;
  height: string | number;
  onClick?(nodeId: string): void;
}

export class BaseGraph extends React.PureComponent<IProps> {
  private readonly container = React.createRef<HTMLDivElement>();
  private mountTimeout?: number | NodeJS.Timeout;
  private graph?: cytoscape.Core;

  public componentDidMount() {
    this.mountTimeout = setTimeout(() => this.draw(this.container.current!), 10);
  }

  public componentWillUnmount() {
    clearTimeout(this.mountTimeout as number);
    if (this.graph) {
      this.graph.destroy();
    }
  }

  public render() {
    return (
      <div ref={this.container} style={{ width: this.props.width, height: this.props.height }} />
    );
  }

  private draw(container: HTMLDivElement) {
    const graph = cytoscape({
      container,
      boxSelectionEnabled: false,
      autounselectify: true,
      layout: { name: 'fcose', animate: false } as any,
      elements: { nodes: this.props.nodes, edges: this.props.edges },
      style: [
        {
          selector: 'node',
          style: {
            label: 'data(label)',
            width: 'data(width)',
            height: 'data(width)',
            color: 'data(fontColor)',
            'font-size': 5,
            'background-color': 'data(bgColor)',
          },
        },
        {
          selector: 'node.hover',
          style: {
            'background-color': '#fff',
          },
        },
        {
          selector: 'edge',
          style: {
            width: 1.5,
            'line-color': '#5c2686',
            'arrow-scale': 0.5,
            'source-arrow-color': '#5c2686',
            'source-arrow-shape': 'triangle',
            'curve-style': 'bezier',
          } as any,
        },
        {
          selector: 'edge.highlighted',
          style: {
            'line-color': '#fff',
            'source-arrow-color': '#fff',
          },
        },
      ],
    });

    if (this.graph) {
      this.graph.destroy();
    }

    this.graph = graph;

    this.attachPathHoverHandle(graph);
    this.attachClickListeners(graph);
    this.attachMouseoverStyles(graph);
  }

  private attachMouseoverStyles(graph: cytoscape.Core) {
    graph.on('mouseover', 'node', ev => {
      const target = ev.target as cytoscape.Collection;
      target.addClass('hover');
    });

    graph.on('mouseout', 'node', ev => {
      const target = ev.target as cytoscape.Collection;
      target.removeClass('hover');
    });
  }

  private attachClickListeners(graph: cytoscape.Core) {
    const handler = this.props.onClick;
    if (!handler) {
      return;
    }

    graph.on('tap', 'node', ev => {
      const target = ev.target as cytoscape.SingularData;
      handler(target.id());
    });
  }

  private attachPathHoverHandle(graph: cytoscape.Core) {
    if (!this.props.rootNode) {
      return;
    }

    const root = graph.collection(
      typeof this.props.rootNode === 'string'
        ? [graph.getElementById(this.props.rootNode)]
        : this.props.rootNode.map(node => graph.getElementById(node)),
    );

    if (root.length === 0) {
      return;
    }

    let lastPath: cytoscape.CollectionReturnValue | null = null;
    graph.on('mouseover', 'node', ev => {
      lastPath = graph
        .elements()
        .dijkstra({ root: ev.target, directed: true })
        .pathTo(root);
      lastPath.addClass('highlighted');
    });

    graph.on('mouseout', 'node', () => {
      if (lastPath) {
        lastPath.removeClass('highlighted');
      }
    });
  }
}

export const fileSizeNode = ({
  fromSize,
  toSize,
  area,
  ...options
}: cytoscape.NodeDataDefinition & {
  fromSize: number;
  toSize: number;
  area: number;
}): cytoscape.NodeDefinition => {
  const hue = fromSize < toSize ? 0 : fromSize > toSize ? 110 : 55;
  const saturation = 40 + Math.min(60, (Math.abs(toSize - fromSize) / (toSize || 1)) * 100);

  return {
    data: {
      ...options,
      label: `${options.label} (${filesize(toSize)}), ${formatPercentageDifference(
        fromSize,
        toSize,
      )}`,
      fontColor: fromSize !== toSize ? '#fff' : '#666',
      bgColor: fromSize !== toSize ? `hsl(${hue}, ${saturation}%, 50%)` : '#666',
      width: Math.round(2 * Math.sqrt(area / Math.PI)),
      height: Math.round(2 * Math.sqrt(area / Math.PI)),
    },
  };
};

export const expandNode = <T extends { identifier: string }>({
  queue,
  getReasons,
  createNode,
}: {
  queue: T[];
  getReasons(node: T): T[];
  createNode(node: T): cytoscape.NodeDefinition;
}) => {
  const nodes: cytoscape.NodeDefinition[] = [];
  const edges: cytoscape.EdgeDefinition[] = [];
  const sources = new Set<string>();

  while (queue.length > 0) {
    const node = queue.pop()!;
    sources.add(node.identifier);

    for (const found of getReasons(node)) {
      if (!sources.has(found.identifier)) {
        queue.push(found);
      }

      edges.push({
        data: {
          id: `edge${node.identifier}to${found.identifier}`,
          source: node.identifier,
          target: found.identifier,
        },
      });
    }

    nodes.push(createNode(node));
  }

  return { nodes, edges };
};

export const expandModuleComparison = (
  comparisons: { [name: string]: IWebpackModuleComparisonOutput },
  roots: IWebpackModuleComparisonOutput[],
) => {
  const maxBubbleArea = 150;
  const minBubbleArea = 30;
  const allComparisons = Object.values(comparisons);
  const maxSize = allComparisons.reduce((max, cmp) => Math.max(max, cmp.toSize), 0);
  const entries: string[] = [];

  const { nodes, edges } = expandNode({
    queue: roots,
    getReasons(node) {
      let reasons: Stats.Reason[] = [];
      if (node.old) {
        reasons = reasons.concat(node.old.reasons as any);
      }
      if (node.new) {
        reasons = reasons.concat(node.new.reasons as any);
      }

      if (reasons.some(r => r.type.includes('entry'))) {
        entries.push(node.identifier);
      }

      return reasons
        .map(r => comparisons[normalizeIdentifier(r.moduleIdentifier || '')])
        .filter(ok => !!ok);
    },
    createNode(node) {
      const weight = node.toSize / maxSize;
      const area = Math.max(minBubbleArea, maxBubbleArea * weight);

      return fileSizeNode({
        id: node.identifier,
        label: node.name,
        area,
        fromSize: node.fromSize,
        toSize: node.toSize,
      });
    },
  });

  return { nodes, edges, entries };
};
