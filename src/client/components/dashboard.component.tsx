import * as React from 'react';
import * as styles from './dashboard.component.scss';
import { connect } from 'react-redux';
import { IAppState, getKnownStats } from '../reducer';
import { Stats } from 'webpack';
import {
  DashboardBuildDate,
  DashboardErrorCount,
  DashboardWarningCount,
  DashboardClose,
} from './dashboard-header.component';
import { Redirect, Route } from 'react-router';
import { DashboardOverview } from './dashboard-overview';

interface IProps {
  stats: Stats.ToJsonOutput[];
}

const DashboardComponent: React.FC<IProps> = ({ stats }) => {
  const first = stats[0];
  const last = stats[stats.length - 1];

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
      <Route path="/dashboard" exact>
        <DashboardOverview first={first} last={last} />
      </Route>
    </div>
  );
};

export const Dashboard = connect((state: IAppState) => ({
  stats: getKnownStats(state),
}))(DashboardComponent);
