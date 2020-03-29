import * as React from 'react';
import * as ReactTestUtils from 'react-dom/test-utils';
import * as ShallowRenderer from 'react-test-renderer/shallow';

import { SignupForm } from '../../src/components/SignupForm';

const renderer = ShallowRenderer.createRenderer();

describe('SignupFormTest --- Render', () => {
	it('Should render', () => {
		renderer.render(<SignupForm
			requestSignup={(_: any) => _}
			succeedSignup={(_: any) => _}
			failSignup={(_: any) => _}
		/>);
		const result = renderer.getRenderOutput();
		ReactTestUtils.isElement(result);
	});
});
