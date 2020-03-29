import * as React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import SignupForm from './SignupForm';
import LoginForm from './LoginForm';
import { URL_HOME, URL_LOGIN, URL_SIGNUP } from '../constants';

export class PublicPage extends React.Component<{}, {}> {
	constructor(props: {}) {
		super(props);
	}

	render() {
		return (
			<div id="public-page-container">
				<Switch>
					<Route path={ URL_SIGNUP } component={ SignupForm }/>
					<Route path={ URL_LOGIN } component={ LoginForm }/>
					// Need to make this check to avoid going into a recursive redirection
					<Route path="*" children={(props) => props.match.url !== URL_HOME ?
						<Redirect from="*" to={ URL_HOME }/> : null}/>
				</Switch>
			</div>
		);
	}
}

export default PublicPage;