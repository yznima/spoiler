import * as ReactDOM from 'react-dom';
import * as React from 'react';
import thunkMiddleware from 'redux-thunk';              // lets us dispatch() functions
import { createLogger } from 'redux-logger';            // neat middleware that logs actions
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';

import App from './App';
import rootReducers from './reducers';
import { Route, BrowserRouter as Router } from 'react-router-dom';

declare const __DEV__: boolean;
declare const __PROD__: boolean;
declare const __TEST__: boolean;

const middleware = __DEV__ ?
	applyMiddleware(thunkMiddleware, createLogger()) : applyMiddleware(thunkMiddleware);

export const store = createStore(rootReducers, middleware);

ReactDOM.render(
	<Provider store={store}>
		<Router>
			<Route path="*" component={App}/>
		</Router>
	</Provider>,
	document.getElementById('react-container')
);