import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import { connect, Dispatch } from 'react-redux';
import { Glyphicon, Nav, Navbar, NavItem } from 'react-bootstrap';
import { MouseEventHandler } from 'react';

import { State } from '../types/state';
import { fetchSignout } from '../actions/index';
import { URL_HOME, URL_LOGIN, URL_SIGNUP, URL_USER_DASHBOARD } from '../constants';

const BRAND_STYLING = { fontSize: 65, fontFamily: 'Cookie', color: '#5cb3fd' };
interface ListNavLinkProps {
	pathname: string,
	linkPath: string,
	activeClassName?: string,
	children: any
}

const ListNavLink: React.SFC<ListNavLinkProps> =
	({ pathname, linkPath, activeClassName = 'active', children }) => {
		return (
			<li className={pathname === linkPath ? activeClassName : ''}>
				<Link to={ linkPath }>
					{ children }
				</Link>
			</li>
		);
	};

interface NavItemsProps {
	pathname: string,
	username?: string
}

interface UserNavItemsProps extends NavItemsProps {
	onSignoutClick: MouseEventHandler<any>
}

const GenericNavItems: React.SFC<NavItemsProps> = ({ pathname }) => (
	<Nav pullRight>
		<ListNavLink linkPath={ URL_LOGIN } pathname={ pathname }>
			<Glyphicon glyph="log-in" style={{ paddingRight: 5 }}/> Login
		</ListNavLink>
		<ListNavLink linkPath={ URL_SIGNUP } pathname={ pathname }>
			<Glyphicon glyph="user" style={{ paddingRight: 5 }}/> Sign up
		</ListNavLink>
	</Nav>
);

const UserNavItems: React.SFC<UserNavItemsProps> = ({ pathname, username, onSignoutClick }) => (
	<Nav pullRight>
		<ListNavLink linkPath={ URL_USER_DASHBOARD } pathname={ pathname }>
			<Glyphicon glyph="user" style={{ paddingRight: 5 }}/> { username }
		</ListNavLink>
		<NavItem onClick={ onSignoutClick }>
			<Glyphicon glyph="log-out" style={{ paddingRight: 5 }}/> Logout
		</NavItem>
	</Nav>
);

export interface DispatchProps {
	onSignoutClick: MouseEventHandler<HTMLAnchorElement>
}

export interface StateProps {
	isLoggedIn: boolean,
	username?: string,
	pathname: string
}

export class Header extends React.Component<RouteComponentProps<any> & StateProps & DispatchProps, any> {
	constructor(props: RouteComponentProps<any> & StateProps & DispatchProps) {
		super(props);
	}

	render() {
		const { isLoggedIn, username, pathname, onSignoutClick } = this.props;
		return (
			<Navbar inverse collapseOnSelect fixedTop>
				<Navbar.Header>
					<Navbar.Brand>
						<Link to={ URL_HOME } style={ BRAND_STYLING }>Branding</Link>
					</Navbar.Brand>
					<Navbar.Toggle/>
				</Navbar.Header>
				<Navbar.Collapse>
					{ !isLoggedIn ?
						<GenericNavItems pathname={ pathname }/> :
						<UserNavItems pathname={ pathname }
						              username={ username }
						              onSignoutClick={ onSignoutClick }/>
					}
				</Navbar.Collapse>
			</Navbar>
		);
	}
}

const mapDispatchToProps = (dispatch: Dispatch<any>): DispatchProps => ({
	onSignoutClick: () => dispatch(fetchSignout())
});

const mapStateToProps = (state: State, ownProps: RouteComponentProps<any>): StateProps => ({
	isLoggedIn: state.clientState && state.clientState.isLoggedIn,
	username: state.clientState && state.clientState.username,
	pathname: ownProps.location.pathname
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Header));
