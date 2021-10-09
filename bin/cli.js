#!/usr/bin/env node
import fs from 'node:fs';
import minimist from 'minimist';
import path from 'node:path';
import {parse} from '../src/index.js';

const argv = minimist(process.argv.slice(2));

const input = argv.i || argv.input;

if (input) {
	const contents = fs.readFileSync(input, 'utf8');
	let {HTML, CSS, JS} = parse(contents, {wrapInHTML: argv.wrap || argv.w || true});

	const output = (argv.o || argv.output || 'dist');
	fs.mkdir(output, () => {});

	HTML = HTML.replace(/<%(css|js)%>/g, 'bundle');

	fs.writeFile(path.resolve(output + '/index.html'), HTML, error => console.log(error || 'Wrote HTML'));
	fs.writeFile(path.resolve(output + '/bundle.css'), CSS, error => console.log(error || 'Wrote CSS'));
	fs.writeFile(path.resolve(output + '/bundle.js'), JS, error => console.log(error || 'Wrote JS'));
} else {
	console.error('No entry point was provided');
}
