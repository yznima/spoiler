import * as React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import UserDashboard from './UserDashboard';
import { URL_HOME, URL_USER_DASHBOARD } from '../constants';

export class HomePage extends React.Component<{}, {}> {
	constructor(props: {}) {
		super(props);
	}

	render() {
		return (
			<div id="home-page" style={{ position: 'relative', top: '15vh' }}>
				<Switch>
					<Route path={ URL_USER_DASHBOARD } component={ UserDashboard }/>
					// Need to make this check to avoid going into a recursive redirection
					<Route path="*" children={(props) => props.match.url !== URL_HOME ?
						<Redirect from="*" to={ URL_HOME }/> : null}/>
				</Switch>
			</div>
		);
	}
}

export default HomePage;