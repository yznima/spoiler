import * as React from 'react';
import * as ReactTestUtils from 'react-dom/test-utils';
import * as ShallowRenderer from 'react-test-renderer/shallow';

import { FormTextField } from '../../src/components/FormTextField';

const renderer = ShallowRenderer.createRenderer();

describe('FormTextFieldTest --- Render', () => {
	it('Should render', () => {
		renderer.render(<FormTextField value={''} onChange={_ => _}/>);
		const result = renderer.getRenderOutput();
		ReactTestUtils.isElement(result);
	});
});
