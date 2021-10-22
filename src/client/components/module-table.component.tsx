import * as filesize from 'filesize';
import { Cell, Column, ColumnCellProps, Table } from 'fixed-data-table-2';
import 'fixed-data-table-2/dist/fixed-data-table.css';
import * as React from 'react';
import { IoIosArrowRoundDown, IoIosArrowRoundUp } from 'react-icons/io';
import { RouteComponentProps, withRouter } from 'react-router';
import { StatsCompilation } from 'webpack';
import {
  compareAllModules,
  getNodeModuleFromIdentifier,
  IWebpackModuleComparisonOutput,
  replaceLoaderInIdentifier
} from '../stat-reducers';
import styles from './module-table.component.scss';
import {
  formatDifference,
  formatPercentageDifference,
  linkToModule,
  linkToNodeModule
} from './util';

interface IProps {
  first: StatsCompilation;
  last: StatsCompilation;
  inChunk?: number;
}

const enum Sort {
  DiffDesc = -2,
  TotalDesc = -1,
  TotalAsc = 1,
  DiffAsc = 2,
}

interface IState {
  diffs: IWebpackModuleComparisonOutput[];
  order: Sort;
  width: number;
}

export const ModuleTable = withRouter(
  class extends React.PureComponent<IProps & RouteComponentProps<{}>, IState> {
    public state: IState = {
      diffs: this.orderDiff(Sort.DiffDesc),
      order: Sort.DiffDesc,
      width: 500,
    };
    private containerRef = React.createRef<HTMLDivElement>();

    public componentDidMount() {
      setTimeout(this.resize, 10);
    }

    public componentDidUpdate(prevProps: IProps) {
      if (prevProps.last !== this.props.last) {
        this.setState({ diffs: this.orderDiff(this.state.order) });
      }
    }

    public render() {
      return (
        <div ref={this.containerRef}>
          <Table
            rowHeight={32}
            width={this.state.width}
            maxHeight={700}
            headerHeight={40}
            rowsCount={this.state.diffs.length}
            className={styles.plot}
            onRowClick={this.onRowClick}
            rowClassNameGetter={this.getRowClassName}
          >
            <Column cell={this.nameCell} width={100} flexGrow={1} header="Module Name" />
            <Column cell={this.totalSizeCell} width={150} header={this.totalHeader} />
            <Column cell={this.diffCell} width={180} header={this.diffHeader} />
          </Table>
        </div>
      );
    }

    private readonly resize = () => {
      this.setState({ width: this.containerRef.current!.clientWidth });
    };

    private readonly getRowClassName = (index: number) => {
      const { fromSize, toSize } = this.state.diffs[index];
      return fromSize === toSize ? styles.muted : null;
    };

    private readonly diffCell = (props: ColumnCellProps) => {
      const { rowIndex, ...rest } = props;
      const target = this.state.diffs[rowIndex];
      return (
        <Cell {...rest} height={40}>
          {formatDifference(target.fromSize, target.toSize, filesize)}
          {` (${formatPercentageDifference(target.fromSize, target.toSize)})`}
        </Cell>
      );
    };

    private readonly totalHeader = () => {
      return (
        <Cell height={40}>
          <a onClick={this.toggleOrderByTotal}>
            Total Size
            {this.state.order === Sort.TotalDesc && <IoIosArrowRoundDown />}
            {this.state.order === Sort.TotalAsc && <IoIosArrowRoundUp />}
          </a>
        </Cell>
      );
    };

    private readonly diffHeader = () => {
      return (
        <Cell>
          <a onClick={this.toggleOrderByDiff}>
            Size Difference
            {this.state.order === Sort.DiffDesc && <IoIosArrowRoundDown />}
            {this.state.order === Sort.DiffAsc && <IoIosArrowRoundUp />}
          </a>
        </Cell>
      );
    };

    private readonly nameCell = (props: ColumnCellProps) => {
      const { rowIndex, ...rest } = props;
      const name = replaceLoaderInIdentifier(this.state.diffs[rowIndex].name);
      return <Cell {...rest} title={name}>{name}</Cell>;
    };

    private readonly totalSizeCell = (props: ColumnCellProps) => {
      const { rowIndex, ...rest } = props;
      return <Cell {...rest}>{filesize(this.state.diffs[rowIndex].toSize)}</Cell>;
    };

    private readonly toggleOrderByDiff = () => {
      const order =
        Math.abs(this.state.order) !== Sort.DiffAsc ? Sort.DiffDesc : this.state.order * -1;
      this.setState({ order, diffs: this.orderDiff(order, this.state.diffs) });
    };

    private readonly toggleOrderByTotal = () => {
      const order =
        Math.abs(this.state.order) !== Sort.TotalAsc ? Sort.TotalDesc : this.state.order * -1;
      this.setState({ order, diffs: this.orderDiff(order, this.state.diffs) });
    };

    private readonly onRowClick = (_: React.SyntheticEvent<Table>, rowIndex: number) => {
      const row = this.state.diffs[rowIndex];
      const nodeModule = getNodeModuleFromIdentifier(row.name);
      this.props.history.push(nodeModule ? linkToNodeModule(nodeModule) : linkToModule(row.name));
    };

    private orderDiff(
      sort: Sort,
      list = Object.values(
        compareAllModules(this.props.first, this.props.last, this.props.inChunk),
      ),
    ) {
      const invert = sort < 0 ? -1 : 1;

      if (sort === Sort.TotalAsc || sort === Sort.TotalDesc) {
        list.sort((a, b) => (a.toSize - b.toSize) * invert);
        return list;
      }

      list.sort((a, b) => {
        const deltaA = a.toSize - a.fromSize;
        const deltaB = b.toSize - b.fromSize;

        if (deltaA === 0) {
          return 1;
        }

        if (deltaB === 0) {
          return -1;
        }

        return (deltaA - deltaB) * invert;
      });

      return list;
    }
  },
);
