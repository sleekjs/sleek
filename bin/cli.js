#!/usr/bin/env node
import minimist from 'minimist';
import {parse} from '../src/index.js';
import fs from 'fs';

const argv = minimist(process.argv.slice(2));

const input = argv.i || argv.input;

if (input) {
	const contents = fs.readFileSync(input, 'utf8');
	let {HTML, CSS, JS} = parse(contents);
	console.log('HTML', HTML);

	const output = (argv.o || argv.output || 'dist');

	HTML = HTML.replace(/<%(css|js)%>/g, 'bundle')

	fs.writeFile(output + '/index.html', HTML, () => {});
	fs.writeFile(output + '/bundle.css', CSS, () => {});
	fs.writeFile(output + '/bundle.js', JS, () => {});
} else {
	console.error('No entry point was provided');
}
