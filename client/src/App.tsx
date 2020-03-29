import * as React from 'react';
import { connect, Dispatch } from 'react-redux';

import { fetchLoginAtBootstrap } from './actions';
import { State } from './types/state';
import Header from './components/Header';
import HomePage from './components/HomePage';
import PublicPage from './components/PublicPage';
import { Route } from 'react-router';

export interface StateProps {
	isLoggedIn: boolean,
	username?: string,
	isBootstrapping: boolean,
}

export interface DispatchProps {
	loadLogin: Function
}

type AppProps = StateProps & DispatchProps;

export class App extends React.Component<AppProps, any> {
	constructor(props: AppProps) {
		super(props);
	}

	componentDidMount(): void {
		if (this.props.isBootstrapping) {
			this.props.loadLogin();
		}
	}

	render() {
		return (
			<div>
				<Route path="*" component={Header}/>
				{ this.props.isBootstrapping ? null : this.props.isLoggedIn ? <HomePage/> : <PublicPage/> }
			</div>
		);
	}
}

const mapDispatchToProps = (dispatch: Dispatch<any>): DispatchProps => ({
	loadLogin: () => dispatch(fetchLoginAtBootstrap())
});

const mapStateToProps = (state: State): StateProps => ({
	isLoggedIn: state.clientState.isLoggedIn,
	username: state.clientState.username,
	isBootstrapping: state.clientState.isBootstrapping
});

export default connect(mapStateToProps, mapDispatchToProps)(App);

