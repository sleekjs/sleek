import {split} from './split.js';
import {resolve} from './resolve.js';

export function parse(code) {
	const {HTML, CSS, JS} = resolve(split(code, true));

	return {HTML, CSS, JS};
}

