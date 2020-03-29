import * as React from 'react';
import * as ReactTestUtils from 'react-dom/test-utils';
import * as ShallowRenderer from 'react-test-renderer/shallow';

import { PublicPage } from '../../src/components/PublicPage';

const renderer = ShallowRenderer.createRenderer();

describe('PublicPageTest --- Render', () => {
	it('Should render', () => {
		renderer.render(<PublicPage/>);
		const result = renderer.getRenderOutput();
		ReactTestUtils.isElement(result);
	});
});
