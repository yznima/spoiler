import { isNil }  from 'lodash';
/**
 * Validate using regex
 * @param  {Object} given     The value to be validated
 * @param  {Number} minLength Expected minimum length. Ignored if == -1
 * @param  {Number} maxLength Expected maximum length. Ignored if == -1
 * @param  {list}   regexList Expected regular expression patterns that the
 *                            given value should include.
 * @return {Boolean}          True if passes all checks, False otherwise
 */
export const validStr = (given: string, minLength: number, maxLength: number, regexList: any) => {
	if (isNil(given) ||
		(minLength !== -1 && given.length < minLength) ||
		(maxLength !== -1 && given.length > maxLength)) {
		return false;
	}

	if (regexList) {
		for (let re of regexList) {
			let match = given.match(re);
			if (match === null || match.length === 0) {
				return false;
			}
		}
	}

	return true;
};