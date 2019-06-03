import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { applyMiddleware, createStore, Middleware } from 'redux';
import Worker from 'worker-loader!./worker/index.worker';
import { Root } from './components/root.component';
import { reducer, IAppState } from './reducer';
import { createEpicMiddleware } from 'redux-observable';
import { epics } from './epics';
import { CompareAction } from './actions'

import '../../node_modules/normalize.css/normalize.css';
import './index.css';

const worker = new Worker();
const workerMiddlware: Middleware = _store => next => action => {
  worker.postMessage(action);
  next(action);
};

const epicMw = createEpicMiddleware<CompareAction, CompareAction, IAppState>();
const store = createStore(
  reducer,
  undefined,
  composeWithDevTools(applyMiddleware(workerMiddlware, epicMw)),
);
worker.onmessage = ev => store.dispatch(ev.data);

epicMw.run(epics);

const Wrapper: React.FC = () => (
  <Provider store={store}>
    <Root />
  </Provider>
);

const target = document.createElement('div');
document.body.appendChild(target);
ReactDOM.render(<Wrapper />, target);
