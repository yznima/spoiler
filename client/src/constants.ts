export const
	API_BASE: string = 'http://localhost:4001',
	API_USER_V1: string = API_BASE + '/api/v1/user',
	API_LOGIN_URL: string = API_USER_V1 + '/login',
	API_SIGNUP_URL: string = API_USER_V1 + '/signup',
	API_SIGNOUT_URL: string = API_USER_V1 + '/signout';

export const
	URL_HOME = '/home',
	URL_LOGIN = '/login',
	URL_SIGNUP = '/signup',
	URL_USER_DASHBOARD = '/dashboard';

// This is just a boiler plate for how the state of the app in redux will look like
// ******************* SHOULD NEVER BE EXPORTED OR USED **************************
import { State } from './types/state';
const state: State = {
	clientState: {
		username: 'User_name',
		isLoggedIn: true,
		isFetching: false,
		isBootstrapping: false
	}
};