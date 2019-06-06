import * as React from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import { Dashboard } from './dashboard.component';
import { EnterUrls } from './enter-urls.component';
import { ScrollToTop } from './scroll-to-top.component';

export const Root: React.FC = () => (
  <Router>
    <Route path="/" exact component={EnterUrls} />
    <Route path="/dashboard" component={Dashboard} />
    <ScrollToTop />
  </Router>
);
