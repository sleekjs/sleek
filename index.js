const split = require('./split');
const resolve = require('./resolve');

module.exports = function parse(code) {
	const {HTML, CSS, JS} = resolve(split(code));

	return {HTML, CSS, JS};
}

