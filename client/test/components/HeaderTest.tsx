import * as React from 'react';
import * as ReactTestUtils from 'react-dom/test-utils';
import * as ShallowRenderer from 'react-test-renderer/shallow';

import { Header } from '../../src/components/Header';

const renderer = ShallowRenderer.createRenderer();

describe('HeaderTest --- Render', () => {
	it('Should render', () => {
		renderer.render(<Header
			match={null}
			location={null}
			history={null}
			onSignoutClick={(_: any) => _}
			pathname="/"
			isLoggedIn={false}
			username={null}
		/>);
		const result = renderer.getRenderOutput();
		ReactTestUtils.isElement(result);
	});
});
