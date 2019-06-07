import * as React from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import { EnterUrls } from './enter-urls.component';
import { IndefiniteProgressBar } from './progress-bar.component';
import { ScrollToTop } from './scroll-to-top.component';

const importDashboard = () => import('./dashboard.component');
const DashboardDeferred = React.lazy(importDashboard);
setTimeout(importDashboard, 500); // start it loading in the background while we enter urls

const LazyDashboard: React.FC = () => (
  <React.Suspense fallback={<IndefiniteProgressBar />}>
    <DashboardDeferred />
  </React.Suspense>
);

export const Root: React.FC = () => (
  <Router>
    <Route path="/" exact component={EnterUrls} />
    <Route path="/dashboard" component={LazyDashboard} />
    <ScrollToTop />
  </Router>
);
