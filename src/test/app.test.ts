import { assert } from "sinon";
import 'mocha';

describe('Some suite', () => {

	describe('Some functionality', () => {

		it('should really just pass', () => {
			assert.pass(true);
		})

		it('should really just fail', () => {
			assert.fail('Check file and line number - source map support!')
		})

	})

})