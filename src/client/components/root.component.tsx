import * as React from 'react';
import { EnterUrls } from './enter-urls.component';
import { HashRouter as Router, Route } from 'react-router-dom';
import { Dashboard } from './dashboard.component';

export const Root: React.FC = () => (
  <Router>
    <Route path="/" exact component={EnterUrls} />
    <Route path="/dashboard" exact component={Dashboard} />
  </Router>
);
