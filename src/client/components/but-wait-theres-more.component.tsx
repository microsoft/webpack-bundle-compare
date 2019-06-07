import * as React from 'react';

interface IProps {
  count: number;
  defaultDisplay?: number;
  children(index: number): React.ReactNode;
}

/**
 * Shows more children behind a "show more" link, when there's very many of them.
 */
export class ButWaitTheresMore extends React.PureComponent<IProps, { limit: number }> {
  public state = { limit: Math.min(this.props.defaultDisplay || 100, this.props.count) };

  public render() {
    const output: React.ReactNode[] = [];
    for (let i = 0; i < this.state.limit; i++) {
      output.push(this.props.children(i));
    }

    return (
      <>
        {output}
        {this.state.limit < this.props.count && (
          <a onClick={this.showMore}>Show More ({this.props.count - this.state.limit} left)</a>
        )}
      </>
    );
  }

  private readonly showMore = () => {
    this.setState({
      limit: Math.min(this.props.count, this.state.limit + (this.props.defaultDisplay || 100)),
    });
  };
}
