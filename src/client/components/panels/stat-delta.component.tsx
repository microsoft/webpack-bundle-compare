import * as React from 'react';
import { formatDifference, formatPercentageDifference } from '../util';

interface IProps {
  newValue: number;
  oldValue?: number;
  className?: string;
  formatter?: (value: number) => string;
}

export class StatDelta extends React.PureComponent<IProps, { percent: boolean }> {
  public state = { percent: true };

  public render() {
    const { oldValue, newValue, className, formatter } = this.props;
    if (oldValue === undefined) {
      return null;
    }

    return (
      <span className={className} onClick={this.toggleMode}>
        {this.state.percent
          ? formatPercentageDifference(oldValue, newValue)
          : formatDifference(oldValue, newValue, formatter)}
      </span>
    );
  }

  private readonly toggleMode = () => {
    this.setState({ percent: !this.state.percent });
  };
}
