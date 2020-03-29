export type State = {
	clientState: ClientState
}

export type ClientState = {
	isLoggedIn: boolean,
	isBootstrapping: boolean,
	isFetching?: boolean,
	username?: string
}
