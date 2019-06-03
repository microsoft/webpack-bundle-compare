import * as React from 'react';
import { IModuleDiffEntry, getModulesDiff } from '../stat-reducers';
import { Stats } from 'webpack';
import * as styles from './module-plot.component.scss';
import { Table, Column, Cell, ColumnCellProps } from 'fixed-data-table-2';
import * as filesize from 'filesize';

import 'fixed-data-table-2/dist/fixed-data-table.css';
import { formatFileSizeDifference, formatPercentageDifference } from './util';
import { IoIosArrowRoundUp, IoIosArrowRoundDown } from 'react-icons/io';

interface IProps {
  first: Stats.ToJsonOutput;
  last: Stats.ToJsonOutput;
}

const enum Sort {
  DiffDesc = -2,
  TotalDesc = -1,
  TotalAsc = 1,
  DiffAsc = 2,
}

interface IState {
  diffs: IModuleDiffEntry[];
  order: Sort;
}

export class ModulePlot extends React.PureComponent<IProps, IState> {
  public state: IState = { diffs: this.orderDiff(Sort.DiffDesc), order: Sort.DiffDesc };

  public componentDidUpdate(prevProps: IProps) {
    if (prevProps.last !== this.props.last) {
      this.setState({ diffs: this.orderDiff(this.state.order) });
    }
  }

  public render() {
    return (
      <Table
        rowHeight={30}
        width={1000}
        maxHeight={window.innerHeight * 2 / 3}
        headerHeight={40}
        rowsCount={this.state.diffs.length}
        className={styles.plot}
      >
        <Column cell={this.nameCell} width={500} flexGrow={1} header="Module Name" />
        <Column cell={this.totalSizeCell} width={150} header={this.totalHeader} />
        <Column cell={this.diffCell} width={200} header={this.diffHeader} />
      </Table>
    );
  }

  private readonly diffCell = (props: ColumnCellProps) => {
    const { rowIndex, ...rest } = props;
    const target = this.state.diffs[rowIndex];
    return (
      <Cell {...rest} height={40}>
        {formatFileSizeDifference(target.fromSize, target.toSize)}
        {target.fromSize > 0 && ` (${formatPercentageDifference(target.fromSize, target.toSize)})`}
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
    return <Cell {...rest}>{this.state.diffs[rowIndex].name}</Cell>;
  };

  private readonly totalSizeCell = (props: ColumnCellProps) => {
    const { rowIndex, ...rest } = props;
    return <Cell {...rest}>{filesize(this.state.diffs[rowIndex].toSize)}</Cell>;
  };

  private readonly toggleOrderByDiff = () => {
    const order = Math.abs(this.state.order) !== Sort.DiffAsc ? Sort.DiffDesc : this.state.order * -1;
    this.setState({ order, diffs: this.orderDiff(order, this.state.diffs) });
  };

  private readonly toggleOrderByTotal = () => {
    const order = Math.abs(this.state.order) !== Sort.TotalAsc ? Sort.TotalDesc : this.state.order * -1;
    this.setState({ order, diffs: this.orderDiff(order, this.state.diffs) });
  };

  private orderDiff(
    sort: Sort,
    list: IModuleDiffEntry[] = getModulesDiff(this.props.first, this.props.last),
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
}
