import * as React from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, Glyphicon } from 'react-bootstrap';
import { connect, Dispatch } from 'react-redux';
import 'whatwg-fetch';

import { validStr } from '../utils/validator';
import { A_Z_LOWER, NUMBER, EMAIL, A_Z_UPPER } from '../utils/regex-pattern';
import FormTextField, { FormGroupStatus } from './FormTextField';
import { User } from '../types/user';
import { API_SIGNUP_URL, URL_LOGIN } from '../constants';
import {
	failSignup,
	requestSignup,
	succeedSignup,
	FETCH_INCLUDE_CREDENTIALS,
	FETCH_POST_METHOD,
	FETCH_JSON_HEADER
} from '../actions/index';

const
	ERROR: FormGroupStatus = 'error',
	WARNING: FormGroupStatus = 'warning',
	SUCCESS: FormGroupStatus = 'success',
	NONE: FormGroupStatus = null;

interface DispatchProps {
	requestSignup: Function,
	succeedSignup: Function,
	failSignup: Function
}

interface SignupFormState {
	fname: string,
	lname: string
	uname: string,
	psswd: string,
	email: string,
	fnameStatus: FormGroupStatus,
	lnameStatus: FormGroupStatus,
	unameStatus: FormGroupStatus,
	psswdStatus: FormGroupStatus,
	emailStatus: FormGroupStatus,
	signupError?: string
}

export class SignupForm extends React.Component<DispatchProps, SignupFormState> {

	constructor(props: DispatchProps) {
		super(props);
		this.state = {
			fname: null,
			lname: null,
			uname: null,
			psswd: null,
			email: null,
			fnameStatus: null,
			lnameStatus: null,
			unameStatus: null,
			psswdStatus: null,
			emailStatus: null,
			signupError: null
		};
	}

	static isUnameValid(uname: string): boolean {
		return validStr(uname, 6, 30, [A_Z_LOWER]);
	}

	static isPsswdValid(psswd: string): boolean {
		return validStr(psswd, 6, -1, [A_Z_LOWER, A_Z_UPPER, /\W/g, NUMBER]);
	}

	static isEmailValid(email: string): boolean {
		return validStr(email, 1, -1, [EMAIL]);
	}

	static isFnameValid(fname: string): boolean {
		return validStr(fname, 1, -1, null);
	}

	static isLnameValid(lname: string): boolean {
		return validStr(lname, 1, -1, null);
	}

	onUnameChange(event: React.ChangeEvent<HTMLInputElement>): void {
		const newUname = event.target.value;
		this.setState({
			uname: newUname,
			unameStatus: SignupForm.isUnameValid(newUname) ? SUCCESS : ERROR
		});
	}

	onPsswdChange(event: React.ChangeEvent<HTMLInputElement>): void {
		const newPsswd = event.target.value;
		this.setState({
			psswd: newPsswd,
			psswdStatus: SignupForm.isPsswdValid(newPsswd) ? SUCCESS : ERROR
		});
	}

	onEmailChange(event: React.ChangeEvent<HTMLInputElement>) {
		const newEmail = event.target.value;
		this.setState({
			email: newEmail,
			emailStatus: SignupForm.isEmailValid(newEmail) ? SUCCESS : ERROR
		});
	}

	onFnameChange(event: React.ChangeEvent<HTMLInputElement>): void {
		const newFname = event.target.value;
		this.setState({
			fname: newFname,
			fnameStatus: SignupForm.isFnameValid(newFname) ? SUCCESS : ERROR
		});
	}

	onLnameChange(event: React.ChangeEvent<HTMLInputElement>): void {
		const newLname = event.target.value;
		this.setState({
			lname: newLname,
			lnameStatus: SignupForm.isLnameValid(newLname) ? SUCCESS : ERROR
		});
	}

	onSignupClick(): void {
		const newState: { [index: string]: boolean } = {
			unameStatus: SignupForm.isUnameValid(this.state.uname),
			psswdStatus: SignupForm.isPsswdValid(this.state.psswd),
			emailStatus: SignupForm.isEmailValid(this.state.email),
			fnameStatus: SignupForm.isFnameValid(this.state.fname),
			lnameStatus: SignupForm.isLnameValid(this.state.lname)
		};

		if (Object.keys(newState).map((status: string): boolean => newState[status]).indexOf(false) >= 0) {
			this.setState({
				unameStatus: newState.unameStatus ? SUCCESS : ERROR,
				psswdStatus: newState.psswdStatus ? SUCCESS : ERROR,
				emailStatus: newState.emailStatus ? SUCCESS : ERROR,
				fnameStatus: newState.fnameStatus ? SUCCESS : ERROR,
				lnameStatus: newState.lnameStatus ? SUCCESS : ERROR,
				signupError: 'Please make sure all the information is provided and correct!'
			});
			return;
		}

		this.setState({ signupError: null }, () => {
			const userInfo = {
				username: this.state.uname,
				password: this.state.psswd,
				email: this.state.email,
				firstname: this.state.fname,
				lastname: this.state.lname
			};

			this.props.requestSignup(userInfo);
			fetch(API_SIGNUP_URL, {
				method: FETCH_POST_METHOD,
				headers: FETCH_JSON_HEADER,
				body: JSON.stringify(userInfo),
				credentials: FETCH_INCLUDE_CREDENTIALS
			}).then((response: Response) => {
				response.json().then(json => {
					if (response.ok) {
						this.props.succeedSignup(json, response.status);
					} else {
						this.setState({ signupError: json.message });
						this.props.failSignup(json, response.status);
					}
				});
			}).catch((e: Error) => {
				this.setState({ signupError: `Failed to sign up. Check you connection!` });
				this.props.failSignup({ message: e.message }, 500);
			});
		});
	}

	render() {
		return (
			<div className="login-page">
				<div className="form">
					<form className="register-form" autoComplete="on">
						{ this.state.signupError ?
							<Alert bsStyle="danger" style={{ textAlign: 'left' }}>
								<Glyphicon glyph="exclamation-sign"/> { this.state.signupError }
							</Alert> : null
						}
						<div style={{ display: 'flex', justifyContent: 'space-between' }}>
							<div style={{ paddingRight: 5 }}>
								<FormTextField
									placeholder="Firstname"
									autoComplete="fname"
									value={ this.state.fname }
									onChange={ this.onFnameChange.bind(this) }
									status={ this.state.fnameStatus }
								/>
							</div>
							<div style={{ paddingLeft: 5 }}>
								<FormTextField
									placeholder="Lastname"
									autoComplete="lname"
									value={ this.state.lname }
									onChange={ this.onLnameChange.bind(this) }
									status={this.state.lnameStatus }
								/>
							</div>
						</div>

						<FormTextField
							placeholder="Email"
							autoComplete="off"
							value={ this.state.email }
							onChange={ this.onEmailChange.bind(this) }
							status={ this.state.emailStatus }
						/>

						<FormTextField
							placeholder="Username"
							value={ this.state.uname }
							onChange={ this.onUnameChange.bind(this) }
							status={ this.state.unameStatus }
						/>

						<FormTextField
							placeholder="Password"
							type="password"
							value={ this.state.psswd }
							onChange={ this.onPsswdChange.bind(this) }
							status={ this.state.psswdStatus }
						/>

						<Button bsClass="button-success" onClick={ this.onSignupClick.bind(this) }>Create</Button>
						<p className="message">Already registered? <Link to={ URL_LOGIN }>Sign
							In</Link></p>
					</form>
				</div>
			</div>
		);
	}
}

const mapDispatchToProps = (dispatch: Dispatch<any>): DispatchProps => ({
	requestSignup: (userLoginInfo: User) => dispatch(requestSignup(userLoginInfo)),
	succeedSignup: (json: JSON, status: number) => dispatch(succeedSignup(json, status)),
	failSignup: (json: JSON, status: number) => dispatch(failSignup(json, status))
});

export default connect(null, mapDispatchToProps)(SignupForm);
