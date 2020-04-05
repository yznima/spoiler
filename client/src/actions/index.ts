import  'whatwg-fetch';
import { createAction } from 'redux-actions';

import { User } from '../types/user';
import { API_LOGIN_URL, API_SIGNOUT_URL } from  '../constants';

// =============================================== DON'T REMOVE ==================================================
// Reference: http://bootstrap-notify.remabledesigns.com/
//
// The following two imports are used for integrating the bootstrap like notification.
// Currently this is disables but will be very useful in future.
// import * as $ from 'jquery';
// import  'bootstrap-notify';
// $.notify({
// icon: "glyphicon glyphicon-warning-info",
// 	title: "Failed to signout: ",
// 	message: json.message
// }, {
// 	type: 'info',
// 		allow_dismiss: true,
// 		newest_on_top: false,
// 		offset: { x: 20, y: 65 },
// 	delay: 1500
// });
// ===============================================================================================================
const API_CALLBACK = (response: any, status: number) => ({
	response,
	status,
	receivedAt: Date.now()
});

// ClientState Actions
export const
	LOGIN_REQUEST = 'LOGIN_LOGIN_REQUEST',
	LOGIN_SUCCEED = 'LOGIN_SUCCEEDED',
	LOGIN_FAIL = 'LOGIN_FAILED',
	SIGNUP_REQUEST = 'SIGNUP_REQUEST',
	SIGNUP_SUCCEED = 'SIGNUP_SUCCEEDED',
	SIGNUP_FAIL = 'SIGNUP_FAILED',
	SIGNOUT_REQUEST = 'SIGNOUT_REQUEST',
	SIGNOUT_SUCCEED = 'SIGNOUT_SUCCEEDED',
	SIGNOUT_FAIL = 'SIGNOUT_FAILED';

export const
	requestLogin = createAction(LOGIN_REQUEST, (userInfo: User) => ({ userInfo })),
	succeedLogin = createAction(LOGIN_SUCCEED, API_CALLBACK),
	failLogin = createAction(LOGIN_FAIL, API_CALLBACK),
	requestSignup = createAction(SIGNUP_REQUEST, (userInfo: User) => ({ userInfo })),
	succeedSignup = createAction(SIGNUP_SUCCEED, API_CALLBACK),
	failSignup = createAction(SIGNUP_FAIL, API_CALLBACK),
	requestSignout = createAction(SIGNOUT_REQUEST),
	succeedSignout = createAction(SIGNOUT_SUCCEED, API_CALLBACK),
	failSignout = createAction(SIGNOUT_FAIL, API_CALLBACK);

// Fetch Helpers
export const
	FETCH_JSON_HEADER = { 'Content-Type': 'application/json' },
	FETCH_POST_METHOD = 'POST',
	FETCH_INCLUDE_CREDENTIALS: RequestCredentials = 'include',
	FETCH_EMPTY_BODY = JSON.stringify({});

// For a reference to AsyncActions in redux see http://redux.js.org/docs/advanced/AsyncActions.html#actionsjs
/**
 * Returns the function to be called to perform a login on bootstrap.
 * Dispatches different login related actions based on the request status.
 *
 * @returns {(dispatch:Function)=>Promise<void|TResult1>}
 */
export function fetchLoginAtBootstrap() {
	return function (dispatch: Function) {
		dispatch(requestLogin(null));
		return fetch(API_LOGIN_URL, {
			method: FETCH_POST_METHOD,
			headers: FETCH_JSON_HEADER,
			body: FETCH_EMPTY_BODY,
			credentials: FETCH_INCLUDE_CREDENTIALS
		}).then((response: Response) => {
			response.json().then((json: JSON) => {
				dispatch(response.ok ?
					succeedLogin(json, response.status) :
					failLogin(json, response.status));
			});
		}, e => dispatch(failLogin({}, 500)));
	};
}

/**
 * Return the function to be called to start a signout outbound request.
 * Dispatches different signout related actions based on the request status.
 *
 * @returns {(dispatch:Function)=>Promise<void|TResult1>}
 */
export function fetchSignout() {
	return function (dispatch: Function) {
		dispatch(requestSignout());
		return fetch(API_SIGNOUT_URL, {
			method: FETCH_POST_METHOD,
			headers: FETCH_JSON_HEADER,
			body: FETCH_EMPTY_BODY,
			credentials: FETCH_INCLUDE_CREDENTIALS
		}).then((response: Response) => {
			response.json().then((json: JSON) => {
				dispatch(response.ok ?
					succeedSignout(json, response.status) :
					failSignout(json, response.status));
			});
		}, e => dispatch(failSignout({}, 500)));
	};
}