import * as React from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import { Dashboard } from './dashboard.component';
import { EnterUrls } from './enter-urls.component';

export const Root: React.FC = () => (
  <Router>
    <Route path="/" exact component={EnterUrls} />
    <Route path="/dashboard" component={Dashboard} />
  </Router>
);
