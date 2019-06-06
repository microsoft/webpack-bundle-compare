import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

class ScrollToTopComponent extends React.PureComponent<RouteComponentProps<{}>> {
  public componentDidUpdate(prevProps: RouteComponentProps<{}>) {
    if (this.props.location !== prevProps.location) {
      window.scrollTo(0, 0);
    }
  }

  public render() {
    return null;
  }
}

export const ScrollToTop = withRouter(ScrollToTopComponent);
