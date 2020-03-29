import * as expect from 'expect';
import * as React from 'react';
import * as ReactTestUtils from 'react-dom/test-utils';
import * as ShallowRenderer from 'react-test-renderer/shallow';
import { App } from '../src/App';
import { PublicPage } from '../src/components/PublicPage';
import HomePage  from '../src/components/HomePage';

const renderer = ShallowRenderer.createRenderer();

describe('AppTest --- Render', () => {
	it('Renders only one child on bootstrap', () => {
		renderer.render(<App isLoggedIn={false}
		                     username={null}
		                     isBootstrapping={true}
		                     loadLogin={(_: any) => _}/>);
		const result = renderer.getRenderOutput();
		expect(result.props.children.length).toBe(2);
		expect(result.props.children[1]).toEqual(null);
	});

	it('Renders PublicPage if no user is logged in', () => {
		renderer.render(<App isLoggedIn={false}
		                     username={null}
		                     isBootstrapping={false}
		                     loadLogin={(_: any) => _}/>);
		const result = renderer.getRenderOutput();
		expect(result.props.children.length).toBe(2);
		ReactTestUtils.isElementOfType(result.props.children[1], PublicPage);
	});

	it('Renders Homepage if user is logged in', () => {
		renderer.render(<App isLoggedIn={true}
		                     username="Nima.Yahayzadeh"
		                     isBootstrapping={false}
		                     loadLogin={(_: any) => _}/>);
		const result = renderer.getRenderOutput();
		expect(result.props.children.length).toBe(2);
		ReactTestUtils.isElementOfType(result.props.children[1], HomePage);
	});
});
