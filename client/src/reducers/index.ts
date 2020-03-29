import { combineReducers } from 'redux';

import { clientStateReducer } from './client-state';

export default combineReducers({
	clientState: clientStateReducer
});