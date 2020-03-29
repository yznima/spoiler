import * as React from 'react';
import * as ReactTestUtils from 'react-dom/test-utils';
import * as ShallowRenderer from 'react-test-renderer/shallow';

import { HomePage } from '../../src/components/HomePage';

const renderer = ShallowRenderer.createRenderer();

describe('HomePageTest --- Render', () => {
	it('Should render', () => {
		renderer.render(<HomePage/>);
		const result = renderer.getRenderOutput();
		ReactTestUtils.isElement(result);
	});
});
