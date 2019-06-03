import * as React from 'react';
import * as styles from './stat-panels.component.scss';
import * as filesize from 'filesize';
import {
  color,
  formatPercentageDifference,
  formatNumberDifference,
  defaultFormatter,
  formatFileSizeDifference,
} from './util';

interface IProps {
  title: React.ReactNode;
  value: number;
  oldValue?: number;
  filesize?: boolean;
}

export class CounterPanel extends React.PureComponent<IProps, { percent: boolean }> {
  public state = { percent: true };
  public render() {
    return (
      <div className={styles.panel} style={{ backgroundColor: this.getColor() }}>
        <span className={styles.title}>{this.props.title}</span>
        <span className={styles.value}>{this.formatValue(this.props.value)}</span>
        {this.props.oldValue !== undefined && (
          <span className={styles.delta} onClick={this.toggleMode}>
            {this.difference(this.props.oldValue)}
          </span>
        )}
      </div>
    );
  }

  private getColor() {
    if (!this.props.oldValue) {
      return color.blue;
    }

    if (this.props.value <= this.props.oldValue) {
      return color.blue;
    }

    if (this.props.value / this.props.oldValue < 1.02) {
      return color.yellow;
    }

    return color.pink;
  }

  private difference(oldValue: number) {
    const delta = this.props.value - oldValue;
    return (
      <>
        {delta !== 0 && <div className={styles.arrow} data-up={delta > 0} />}
        {this.state.percent
          ? formatPercentageDifference(oldValue, this.props.value)
          : this.props.filesize
          ? formatFileSizeDifference(oldValue, this.props.value)
          : formatNumberDifference(oldValue, this.props.value)}
      </>
    );
  }

  private formatValue(value: number) {
    return this.props.filesize ? filesize(value) : defaultFormatter.format(value);
  }

  private readonly toggleMode = () => {
    this.setState({ percent: !this.state.percent });
  };
}
