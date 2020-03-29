import { Action } from 'redux-actions';

import {
	LOGIN_REQUEST,
	LOGIN_SUCCEED,
	LOGIN_FAIL,
	SIGNUP_REQUEST,
	SIGNUP_SUCCEED,
	SIGNUP_FAIL,
	SIGNOUT_FAIL,
	SIGNOUT_REQUEST,
	SIGNOUT_SUCCEED
} from '../actions/index';
import { ClientState } from '../types/state';


interface Payload {
	response: any,
	receivedAt: number,
	status: number
}

/**
 * Redux reducer to for the client state.
 *
 * @param state The current client state
 * @param action The action to observe
 * @returns {any} The new client state base on the previous and the action
 */
export const clientStateReducer = (state: ClientState = {
	username: null,
	isLoggedIn: false,
	isFetching: false,
	isBootstrapping: true
}, action: Action<Payload>): ClientState => {
	switch (action.type) {
		case LOGIN_REQUEST:
		case SIGNUP_REQUEST:
			return Object.assign({}, state, {
				isLoggedIn: false,
				username: null,
				isFetching: true
			});
		case LOGIN_SUCCEED:
		case SIGNUP_SUCCEED:
			return {
				isLoggedIn: true,
				username: action.payload.response.username,
				isFetching: false,
				isBootstrapping: false
			};
		case SIGNOUT_SUCCEED:
		case LOGIN_FAIL:
		case SIGNUP_FAIL:
			return {
				username: null,
				isLoggedIn: false,
				isFetching: false,
				isBootstrapping: false
			};
		case SIGNOUT_FAIL:
			return action.payload && action.payload.status === 401 ? {
				username: null,
				isLoggedIn: false,
				isFetching: false,
				isBootstrapping: false
			} : Object.assign({}, state, { isFetching: false });
		case SIGNOUT_REQUEST:
			return Object.assign({}, state, {
				isFetching: true
			});
		default:
			return state;
	}
};