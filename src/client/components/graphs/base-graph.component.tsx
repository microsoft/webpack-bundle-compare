import * as cytoscape from 'cytoscape';
import * as filesize from 'filesize';
import { Base64 } from 'js-base64';
import * as React from 'react';
import { IoIosContract, IoIosExpand } from 'react-icons/io';
import {
  getReasons,
  IWebpackModuleComparisonOutput,
  normalizeIdentifier,
} from '../../stat-reducers';
import { formatPercentageDifference } from '../util';
import * as styles from './base-graph.component.scss';

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

const enum FilterState {
  NoFilter,
  DidFilter,
  RemovedFiler,
}

const nodeHideThreshold = 100;
const labelHideThreshold = 100;

export class BaseGraph extends React.PureComponent<IProps, { filter: FilterState }> {
  public state = { filter: FilterState.NoFilter };

  private readonly container = React.createRef<HTMLDivElement>();
  private mountTimeout?: number | NodeJS.Timeout;
  private graph?: cytoscape.Core;
  private readonly zoomIn = this.createZoomFn(1);
  private readonly zoomOut = this.createZoomFn(-1);

  public componentDidMount() {
    this.mountTimeout = setTimeout(() => this.draw(this.container.current!), 10);
  }

  public componentDidUpdate(prevProps: IProps) {
    if (
      (prevProps.edges !== this.props.edges || prevProps.nodes !== this.props.nodes) &&
      this.container.current
    ) {
      this.draw(this.container.current);
    }
  }

  public componentWillUnmount() {
    clearTimeout(this.mountTimeout as number);
    if (this.graph) {
      this.graph.destroy();
    }
  }

  public render() {
    return (
      <div className={styles.container}>
        <div ref={this.container} style={{ width: this.props.width, height: this.props.height }} />
        <div className={styles.controls}>
          {this.state.filter === FilterState.DidFilter && (
            <>
              For performance reasons, only part of the graph is shown.{' '}
              <a onClick={this.unfilter}>Click here</a> to show the entire graph.
            </>
          )}
          <button onClick={this.zoomIn}>
            <IoIosExpand />
          </button>
          <button onClick={this.zoomOut}>
            <IoIosContract />
          </button>
        </div>
      </div>
    );
  }

  private createZoomFn(multiplier: number) {
    return (evt: React.MouseEvent) => {
      if (this.graph) {
        const nextZoom = this.graph.zoom() + multiplier * (evt.shiftKey ? 10 : 1);
        this.graph.zoom(Math.max(1, nextZoom));
      }
    };
  }

  private draw(container: HTMLDivElement, filter: FilterState = this.state.filter) {
    let { nodes, edges } = this.props;
    if (nodes.length > nodeHideThreshold && filter !== FilterState.RemovedFiler) {
      nodes = nodes.slice(0, nodeHideThreshold);
      edges = filterUnattachedEdges(nodes, edges);
      this.setState({ filter: FilterState.DidFilter });
    }

    if (this.graph) {
      this.graph.destroy();
    }

    const graph = cytoscape({
      container,
      boxSelectionEnabled: false,
      autounselectify: true,
      userZoomingEnabled: false,
      layout: { name: 'fcose', animate: false, nodeSeparation: 150, quality: 'proof' } as any,
      elements: { nodes, edges },
      style: [
        {
          selector: 'node',
          style: {
            label: nodes.length < labelHideThreshold ? 'data(label)' : undefined,
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
            label: 'data(label)',
            'background-color': '#fff',
          },
        },
        {
          selector: 'edge',
          style: {
            width: 1.5,
            'line-color': '#5c2686',
            'arrow-scale': 0.3,
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
        {
          selector: 'node.highlighted',
          style: {
            label: 'data(label)',
          },
        },
      ],
    });

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

  private readonly unfilter = () => {
    if (this.container.current) {
      this.draw(this.container.current, FilterState.RemovedFiler);
      this.setState({ filter: FilterState.NoFilter });
    }
  };
}

export const filterUnattachedEdges = (
  nodes: cytoscape.NodeDefinition[],
  edges: cytoscape.EdgeDefinition[],
) => {
  const nodeIds = new Set();
  for (const node of nodes) {
    nodeIds.add(node.data.id);
  }

  const outEdges: cytoscape.EdgeDefinition[] = [];
  for (const edge of edges) {
    if (nodeIds.has(edge.data.source) && nodeIds.has(edge.data.target)) {
      outEdges.push(edge);
    }
  }

  return outEdges;
};

export const fileSizeNode = ({
  fromSize,
  toSize,
  area,
  ...options
}: cytoscape.NodeDataDefinition & {
  fromSize: number;
  toSize: number;
  area: number;
}): cytoscape.NodeDataDefinition => {
  const hue = fromSize < toSize ? 0 : fromSize > toSize ? 110 : 55;
  const saturation = 40 + Math.min(60, (Math.abs(toSize - fromSize) / (toSize || 1)) * 100);

  return {
    ...options,
    label: `${options.label} (${filesize(toSize)}), ${formatPercentageDifference(
      fromSize,
      toSize,
    )}`,
    fontColor: fromSize !== toSize ? '#fff' : '#666',
    bgColor: fromSize !== toSize ? `hsl(${hue}, ${saturation}%, 50%)` : '#666',
    width: Math.round(2 * Math.sqrt(area / Math.PI)),
    height: Math.round(2 * Math.sqrt(area / Math.PI)),
  };
};

export const expandNode = <T extends { identifier: string }>({
  roots,
  getReasons: getReasonsFn,
  createNode,
  maxDepth = Infinity,
  limit = 1000,
}: {
  roots: T[];
  limit?: number;
  maxDepth?: number;
  getReasons(node: T): T[];
  createNode(node: T, id: string): cytoscape.NodeDataDefinition;
}) => {
  const queue = roots.map(node => ({ node, depth: 0 }));
  const nodes: cytoscape.NodeDefinition[] = [];
  const sources = new Set<string>(roots.map(q => q.identifier));
  const edges: cytoscape.EdgeDefinition[] = [];
  let needsFiltering = false;

  while (queue.length > 0) {
    const { node, depth } = queue.pop()!;
    if (depth > maxDepth) {
      needsFiltering = true;
      break;
    }

    if (--limit === 0) {
      needsFiltering = true;
      break;
    }

    const sourceEncoded = Base64.encodeURI(node.identifier);
    for (const found of getReasonsFn(node)) {
      const foundEncoded = Base64.encodeURI(found.identifier);

      if (!sources.has(found.identifier)) {
        sources.add(found.identifier);
        queue.push({ node: found, depth: depth + 1 });
      }

      edges.push({
        data: {
          id: `edge${sourceEncoded}to${foundEncoded}`,
          source: sourceEncoded,
          target: foundEncoded,
        },
      });
    }

    nodes.push({
      data: {
        ...createNode(node, sourceEncoded),
        depth,
      },
    });
  }

  nodes.sort((a, b) => a.data.depth - b.data.depth);

  return { nodes, edges: needsFiltering ? filterUnattachedEdges(nodes, edges) : edges };
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
    roots,
    getReasons(node) {
      const output: IWebpackModuleComparisonOutput[] = [];

      for (const fnModule of [node.old, node.new]) {
        if (!fnModule) {
          continue;
        }

        for (const reason of getReasons(fnModule)) {
          const other = comparisons[normalizeIdentifier(reason.moduleIdentifier)];
          if (other) {
            output.push(other);
          }

          if (reason.type && reason.type.includes('entry')) {
            entries.push(Base64.encodeURI(node.identifier));
          }
        }
      }

      return output;
    },
    createNode(node, id) {
      const weight = node.toSize / maxSize;
      const area = Math.max(minBubbleArea, maxBubbleArea * weight);

      return fileSizeNode({
        id,
        label: node.name,
        area,
        fromSize: node.fromSize,
        toSize: node.toSize,
      });
    },
  });

  return { nodes, edges, entries };
};
