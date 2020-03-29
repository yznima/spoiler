import * as React from 'react';
import * as ReactTestUtils from 'react-dom/test-utils';
import * as ShallowRenderer from 'react-test-renderer/shallow';

import { UserDashboard } from '../../src/components/UserDashboard';

const renderer = ShallowRenderer.createRenderer();

describe('UserDashboardTest --- Render', () => {
	it('Should render', () => {
		renderer.render(<UserDashboard/>);
		const result = renderer.getRenderOutput();
		ReactTestUtils.isElement(result);

	});
});
