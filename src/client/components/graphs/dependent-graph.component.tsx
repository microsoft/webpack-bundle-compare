import * as cytoscape from 'cytoscape';
import { Base64 } from 'js-base64';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { StatsCompilation, StatsModule } from 'webpack';
import {
  compareAllModules,
  getDirectImportsOfNodeModule,
  getImportsOfName,
  getNodeModuleFromIdentifier,
  normalizeName,
  replaceLoaderInIdentifier
} from '../../stat-reducers';
import { color, linkToModule, linkToNodeModule } from '../util';
import { expandModuleComparison, LazyBaseGraph } from './graph-tool';

interface IProps {
  previous: StatsCompilation;
  stats: StatsCompilation;
  chunkId?: number;
}

interface IState {
  nodes: cytoscape.NodeDefinition[];
  edges: cytoscape.EdgeDefinition[];
  entries: string[];
}

const createDependentGraph = <P extends {}>(
  rootFinder: (props: IProps & P) => StatsModule[],
  rootLabel: (props: IProps & P) => string,
) =>
  withRouter(
    class DependentGraph extends React.PureComponent<IProps & P & RouteComponentProps<{}>, IState> {
      public state: IState = this.buildData();

      public componentDidUpdate(prevProps: IProps & P & RouteComponentProps<{}>) {
        if (
          this.props.stats !== prevProps.stats ||
          this.props.chunkId !== this.props.chunkId ||
          rootFinder(this.props)
            .map(m => m.identifier)
            .join(',') !==
            rootFinder(prevProps)
              .map(m => m.identifier)
              .join(',')
        ) {
          this.setState(this.buildData());
        }
      }

      public render() {
        return (
          <LazyBaseGraph
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
        const directImports = rootFinder(this.props);
        const comparisons = compareAllModules(
          this.props.previous,
          this.props.stats,
          this.props.chunkId,
        );

        const { nodes, edges } = expandModuleComparison(
          comparisons,
          directImports.map(imp => comparisons[normalizeName(imp.name)]).filter(ok => !!ok),
        );

        for (const edge of edges) {
          [edge.data.source, edge.data.target] = [edge.data.target, edge.data.source];
        }

        nodes.unshift({
          data: {
            id: 'index',
            label: rootLabel(this.props),
            fontColor: '#fff',
            bgColor: color.blue,
            width: 20,
            height: 20,
          },
        });

        for (const direct of directImports) {
          if (!direct.name) {
            continue;
          }

          const directId = Base64.encodeURI(direct.name);
          edges.push({
            data: {
              id: `${directId}toIndex`,
              source: directId,
              target: 'index',
            },
          });
        }

        return { nodes, edges, entries: ['index'] };
      }

      private readonly onClick = (encodedId: string) => {
        const nodeId = Base64.decode(encodedId);
        const nodeModule = getNodeModuleFromIdentifier(nodeId);
        this.props.history.push(nodeModule ? linkToNodeModule(nodeModule) : linkToModule(nodeId));
      };
    },
  );

/**
 * Graphs the dependent tree for a node module.
 */
export const NodeModuleDependentGraph = createDependentGraph<{ name: string }>(
  props => getDirectImportsOfNodeModule(props.stats, props.name),
  props => props.name,
);

/**
 * Graphs the dependent tree for a node module.
 */
export const GenericDependentGraph = createDependentGraph<{ root: StatsModule }>(
  props => props.root.name ? getImportsOfName(props.stats, props.root.name) : [],
  props => replaceLoaderInIdentifier(props.root.name),
);
