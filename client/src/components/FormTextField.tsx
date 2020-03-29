import * as React from 'react';
import { FormControl, FormGroup } from 'react-bootstrap';
import { uniqueId } from 'lodash';

// import * as $ from "jquery";
// (window as any).jQuery = $;
// import "bootstrap"

export type FormGroupStatus = 'success' | 'error' | 'warning' | null;

interface FormTextFieldProps {
	value: string,
	type?: string,
	help?: string,
	title?: string,
	status?: FormGroupStatus,
	autoComplete?: string
	placeholder?: string,
	required?: boolean,
	onChange: React.ChangeEventHandler<any>
	onBlur?: React.FocusEventHandler<any>,
}

export class FormTextField extends React.Component<FormTextFieldProps, any> {
	id: string;

	public static defaultProps: Partial<FormTextFieldProps> = {
		type: 'text',
		onBlur: _ => _
	};

	constructor(props: FormTextFieldProps) {
		super(props);
		this.id = uniqueId('frm_id_');
	}

	render(): JSX.Element {
		const { value, type, status, autoComplete, placeholder, onChange, onBlur } = this.props;
		return (
			<FormGroup controlId={ this.id } validationState={ status }>
				<FormControl type={ type }
				             value={ value || '' }
				             onChange={ onChange }
				             onBlur={ onBlur }
				             placeholder={ placeholder }
				             autoComplete={ autoComplete }
				             style={ status ? {} : { border: 0 } }/>
			</FormGroup>
		);
	}
}

export default FormTextField;