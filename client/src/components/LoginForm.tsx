import * as React from 'react';
import { Link } from 'react-router-dom';
import { connect, Dispatch } from 'react-redux';
import { Alert, Glyphicon } from 'react-bootstrap';
import 'whatwg-fetch';

import { User } from '../types/user';
import { API_LOGIN_URL, URL_SIGNUP } from '../constants';
import FormTextField from './FormTextField';
import {
	failLogin,
	requestLogin,
	succeedLogin,
	FETCH_INCLUDE_CREDENTIALS,
	FETCH_POST_METHOD,
	FETCH_JSON_HEADER
} from '../actions/index';

interface DispatchProps {
	requestLogin: Function,
	succeedLogin: Function,
	failLogin: Function
}

interface LoginFormState {
	uname: string,
	psswd: string,
	loginError?: string
}

export class LoginForm extends React.Component<DispatchProps, LoginFormState> {
	constructor(props: DispatchProps) {
		super(props);
		this.state = { uname: null, psswd: null };
		this.onLoginClick = this.onLoginClick.bind(this);
		this.onUnameChange = this.onUnameChange.bind(this);
		this.onPsswdChange = this.onPsswdChange.bind(this);
	}

	onUnameChange(event: React.ChangeEvent<HTMLInputElement>) {
		this.setState({ uname: event.target.value });
	}

	onPsswdChange(event: React.ChangeEvent<HTMLInputElement>) {
		this.setState({ psswd: event.target.value });
	}

	onLoginClick(): void {
		const userInfo = {
			username: this.state.uname,
			password: this.state.psswd
		};

		this.props.requestLogin(userInfo);
		fetch(API_LOGIN_URL, {
			method: FETCH_POST_METHOD,
			headers: FETCH_JSON_HEADER,
			body: JSON.stringify(userInfo),
			credentials: FETCH_INCLUDE_CREDENTIALS
		}).then((response: Response) => {
			response.json().then(json => {
				if (response.ok) {
					this.setState({ loginError: null });
					this.props.succeedLogin(json, response.status);
				} else {
					this.setState({ loginError: json.message });
					this.props.failLogin(json, response.status);
				}
			});
		}).catch((e: Error) => {
			this.setState({ loginError: `Failed to login. Check you connection!` });
			this.props.failLogin({ message: e.message }, 500);
		});
	}

	render(): JSX.Element {
		return (
			<div className="login-page">
				<div className="form">
					<form className="login-form">
						{ this.state.loginError ?
							<Alert bsStyle="danger" style={{ textAlign: 'left' }}>
								<Glyphicon glyph="exclamation-sign"/> { this.state.loginError }
							</Alert> : null
						}
						<FormTextField placeholder="Username or email" type="text"
						               autoComplete="username"
						               value={ this.state.uname } onChange={ this.onUnameChange }/>
						<FormTextField placeholder="Password" type="password"
						               autoComplete="password"
						               value={ this.state.psswd } onChange={ this.onPsswdChange }/>
						<button type="button" onClick={ this.onLoginClick }>Login</button>
						<p className="message">Not registered? <Link to={ URL_SIGNUP }>Create
							an account</Link>
						</p>
					</form>
				</div>
			</div>
		);
	}
}

const mapDispatchToProps = (dispatch: Dispatch<any>): DispatchProps => ({
	requestLogin: (userLoginInfo: User) => dispatch(requestLogin(userLoginInfo)),
	succeedLogin: (json: JSON, status: number) => dispatch(succeedLogin(json, status)),
	failLogin: (json: JSON, status: number) => dispatch(failLogin(json, status))
});

export default connect(null, mapDispatchToProps)(LoginForm);