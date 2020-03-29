import * as expect from 'expect';
import { validStr }from '../../src/utils/validator';
import { A_Z_LOWER, A_Z_UPPER, EMAIL } from "../../src/utils/regex-pattern";

describe('ValidatorTest', () => {
	it('Should not validate wrong values', () => {
		expect(validStr(null, 10, 20, [])).toBeFalsy();
		expect(validStr("MyString", 10, 20, [])).toBeFalsy(); // Too Short
		expect(validStr("MyString", 1, 5, [])).toBeFalsy(); // To0 Long
		expect(validStr("MyString", 1, 2, [EMAIL])).toBeFalsy(); // Doesn't match regex
	});

	it('Should validate correct values', () => {
		expect(validStr("MyString", 1, 10, [])).toBeTruthy();
		expect(validStr("MyString", 1, -1, [])).toBeTruthy();
		expect(validStr("MyString", 1, 10, [A_Z_LOWER, A_Z_UPPER])).toBeTruthy(); // Doesn't match regex
	});
});