const split = require('./split');
const resolve = require('./resolve');

module.exports = function parse(code) {
	const {HTML, CSS, JS} = resolve(split(code, true));

	return {HTML, CSS, JS};
}

