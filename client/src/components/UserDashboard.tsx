import * as React from 'react';

export class UserDashboard extends React.Component<{}, {}> {
	constructor(props: {}) {
		super(props);
	}

	render() {
		return (
			<h1>User dashboard</h1>
		);
	}
}

// For later if this component gets redux connected
export default UserDashboard;