import * as React from 'react';
import { connect } from 'react-redux';
import { Redirect, Route, RouteChildrenProps } from 'react-router';
import { Stats } from 'webpack';
import { getKnownStats, IAppState } from '../redux/reducer';
import { DashboardChunkPage } from './dashboard-chunk-page.component';
import {
  DashboardBuildDate,
  DashboardClose,
  DashboardErrorCount,
  DashboardWarningCount,
} from './dashboard-header.component';
import { DashboardNodeModulePage } from './dashboard-node-module-page.component';
import { DashboardOverview } from './dashboard-overview';
import { DashboardOwnModulePage } from './dashboard-own-module-page.component';
import * as styles from './dashboard.component.scss';

interface IProps {
  stats: Stats.ToJsonOutput[];
}

class DashboardComponent extends React.PureComponent<IProps> {
  private get first() {
    return this.props.stats[0];
  }

  private get last() {
    return this.props.stats[this.props.stats.length - 1];
  }

  public render() {
    const { first, last } = this;
    if (!first) {
      return <Redirect to="/" />;
    }

    return (
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <DashboardBuildDate first={first} last={last} />
          <DashboardErrorCount last={last} />
          <DashboardWarningCount last={last} />
          <div style={{ flex: 1 }} />
          <DashboardClose />
        </div>
        <Route path="/dashboard" exact component={this.renderOverview} />
        <Route path="/dashboard/chunk/:chunkId" exact component={this.renderChunkPage} />
        <Route
          path="/dashboard/nodemodule/:encodedModule"
          exact
          component={this.renderNodeModule}
        />
        <Route
          path="/dashboard/ownmodule/:encodedModule"
          exact
          component={this.renderGenericModule}
        />
      </div>
    );
  }

  private readonly renderOverview: React.FC<void> = () => (
    <DashboardOverview first={this.first} last={this.last} />
  );

  private readonly renderChunkPage: React.FC<RouteChildrenProps<{ chunkId: string }>> = ({
    match,
  }) =>
    match && (
      <DashboardChunkPage
        chunk={Number(match.params.chunkId)}
        first={this.first}
        last={this.last}
      />
    );

  private readonly renderNodeModule: React.FC<RouteChildrenProps<{ encodedModule: string }>> = ({
    match,
  }) =>
    match && (
      <DashboardNodeModulePage
        name={Base64.decode(match.params.encodedModule)}
        first={this.first}
        last={this.last}
      />
    );

  private readonly renderGenericModule: React.FC<RouteChildrenProps<{ encodedModule: string }>> = ({
    match,
  }) =>
    match && (
      <DashboardOwnModulePage
        name={Base64.decode(match.params.encodedModule)}
        first={this.first}
        last={this.last}
      />
    );
}

export const Dashboard = connect((state: IAppState) => ({
  stats: getKnownStats(state),
}))(DashboardComponent);
