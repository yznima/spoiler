import * as React from 'react';
import * as ReactTestUtils from 'react-dom/test-utils';
import * as ShallowRenderer from 'react-test-renderer/shallow';

import { LoginForm } from '../../src/components/LoginForm';

const renderer = ShallowRenderer.createRenderer();

describe('LoginFormTest --- Render', () => {
	it('Should render', () => {
		renderer.render(<LoginForm
			requestLogin={(_: any) => _}
			succeedLogin={(_: any) => _}
			failLogin={(_: any) => _}
		/>);
		const result = renderer.getRenderOutput();
		ReactTestUtils.isElement(result);
	});
});
