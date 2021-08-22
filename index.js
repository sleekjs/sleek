const split = require('./split');

function parse(code) {
	const {HTML, CSS, JS} = split(code);

	return {HTML, CSS, JS};
}

console.log(parse(`
<script>
	const name = 'world';

	function getColor(text) {
		return '#' + text.toLowerCase().slice(0, 6).padEnd(6, 0).replace(/[^0-9a-f]/g, 0);
	}

	let seconds = 0;

	setInterval(() => seconds++, 1000)
</script>

<h1>Hello {name}!<h1>

<p style='color: {getColor(name)}'>This is your color</p>

<p>You have been here for {seconds} seconds</p>
`.trim()))
