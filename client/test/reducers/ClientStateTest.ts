import * as expect from 'expect';
import { clientStateReducer } from '../../src/reducers/client-state';
import {
	LOGIN_FAIL,
	LOGIN_REQUEST,
	LOGIN_SUCCEED,
	SIGNOUT_FAIL,
	SIGNOUT_REQUEST,
	SIGNOUT_SUCCEED,
	SIGNUP_FAIL,
	SIGNUP_SUCCEED,
	SIGNUP_REQUEST
} from '../../src/actions';
import { ClientState } from '../../src/types/state';

describe('ClientStateTest --- Initial', () => {
	it('Return correct initial state', () => {
		expect(clientStateReducer(undefined, { type: 'Test' })).toEqual({
			username: null,
			isLoggedIn: false,
			isFetching: false,
			isBootstrapping: true
		});
	});
});

describe('ClientStateTest --- Signout', () => {
	it('Return correct state after sign out is requested', () => {
		// Given a logged in user
		const state: ClientState = {
			username: 'Nima.Yahyazadeh',
			isLoggedIn: true,
			isFetching: false,
			isBootstrapping: false
		};

		expect(clientStateReducer(state, { type: SIGNOUT_REQUEST })).toEqual({
			username: 'Nima.Yahyazadeh',
			isLoggedIn: true,
			isFetching: true,
			isBootstrapping: false
		});
	});

	it('Return correct state after sign out request fails', () => {
		// Given a logged in user
		const state: ClientState = {
			username: 'Nima.Yahyazadeh',
			isLoggedIn: true,
			isFetching: true,
			isBootstrapping: false
		};

		expect(clientStateReducer(state, { type: SIGNOUT_FAIL })).toEqual({
			username: 'Nima.Yahyazadeh',
			isLoggedIn: true,
			isFetching: false,
			isBootstrapping: false
		});
	});

	it('Return correct state after sign out is unauthorized', () => {
		// Given a logged in user
		const state: ClientState = {
			username: 'Nima.Yahyazadeh',
			isLoggedIn: true,
			isFetching: true,
			isBootstrapping: false
		};

		expect(clientStateReducer(state, {
			type: SIGNOUT_FAIL,
			payload: { status: 401, response: 'Unauthorized', receivedAt: Date.now() }
		})).toEqual({
			username: null,
			isLoggedIn: false,
			isFetching: false,
			isBootstrapping: false
		});
	});


	it('Return correct state after sign out request succeeds', () => {
		// Given a logged in user
		const state: ClientState = {
			username: 'Nima.Yahyazadeh',
			isLoggedIn: true,
			isFetching: true,
			isBootstrapping: false
		};

		expect(clientStateReducer(state, { type: SIGNOUT_SUCCEED })).toEqual({
			username: null,
			isLoggedIn: false,
			isFetching: false,
			isBootstrapping: false
		});
	});
});

describe('ClientStateTest --- Login ', () => {

	it('Return correct state after login is requested', () => {
		// Given a no user is logged in
		const state: ClientState = {
			username: null,
			isLoggedIn: false,
			isFetching: false,
			isBootstrapping: false
		};

		expect(clientStateReducer(state, { type: LOGIN_REQUEST })).toEqual({
			username: null,
			isLoggedIn: false,
			isFetching: true,
			isBootstrapping: false
		});
	});

	it('Return correct state after login request fails', () => {
		// Given no user is logged in
		const state: ClientState = {
			username: null,
			isLoggedIn: false,
			isFetching: true,
			isBootstrapping: false
		};

		expect(clientStateReducer(state, { type: LOGIN_FAIL })).toEqual({
			username: null,
			isLoggedIn: false,
			isFetching: false,
			isBootstrapping: false
		});
	});

	it('Return correct state after login request succeeds', () => {
		// Given no user is logged in
		const state: ClientState = {
			username: null,
			isLoggedIn: false,
			isFetching: true,
			isBootstrapping: false
		};

		expect(clientStateReducer(state, {
			type: LOGIN_SUCCEED,
			payload: {
				response: { username: 'Nima.Yahyazadeh' },
				receivedAt: Date.now(),
				status: 200
			}
		})).toEqual({
			username: 'Nima.Yahyazadeh',
			isLoggedIn: true,
			isFetching: false,
			isBootstrapping: false
		});
	});
});


describe('ClientStateTest --- Signup', () => {

	it('Return correct state after sign-up is requested', () => {
		// Given a no user is logged in
		const state: ClientState = {
			username: null,
			isLoggedIn: false,
			isFetching: false,
			isBootstrapping: false
		};

		expect(clientStateReducer(state, { type: SIGNUP_REQUEST })).toEqual({
			username: null,
			isLoggedIn: false,
			isFetching: true,
			isBootstrapping: false
		});
	});

	it('Return correct state after sign-up request fails', () => {
		// Given no user is logged in
		const state: ClientState = {
			username: null,
			isLoggedIn: false,
			isFetching: true,
			isBootstrapping: false
		};

		expect(clientStateReducer(state, { type: SIGNUP_FAIL })).toEqual({
			username: null,
			isLoggedIn: false,
			isFetching: false,
			isBootstrapping: false
		});
	});

	it('Return correct state after sign-up request succeeds', () => {
		// Given no user is logged in
		const state: ClientState = {
			username: null,
			isLoggedIn: false,
			isFetching: true,
			isBootstrapping: false
		};

		expect(clientStateReducer(state, {
			type: SIGNUP_SUCCEED,
			payload: {
				response: { username: 'Nima.Yahyazadeh' },
				receivedAt: Date.now(),
				status: 200
			}
		})).toEqual({
			username: 'Nima.Yahyazadeh',
			isLoggedIn: true,
			isFetching: false,
			isBootstrapping: false
		});
	});
});