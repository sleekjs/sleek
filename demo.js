import {parse} from './index.js';
import fs from 'fs';

let {HTML, CSS, JS} = parse(`
<script>
	import Hello from 'hello.fwrk';
	import Foo from 'nowhere';
	const name = 'world';

	function getColor(text) {
		return '#' + text.toLowerCase().slice(0, 6).padEnd(6, 0).replace(/[^0-9a-f]/g, 0);
	}

	let seconds = 0;

	setInterval(() => seconds++, 1000)
</script>

<Hello/>

<p style='color: {getColor(name)}'>This is your color</p>

<p>You have been here for {seconds} seconds</p>

<style>
* {
	color: red;
}
</style>
`.trim());

HTML = HTML.replace(/<%(css|js)%>/g, 'bundle')

fs.writeFileSync('bundle.html', HTML);
fs.writeFileSync('bundle.css', CSS);
fs.writeFileSync('bundle.js', JS);

