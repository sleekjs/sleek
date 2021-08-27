#!/usr/bin/env node
import minimist from 'minimist';
import {parse} from '../src/index.js';
import fs from 'fs';
import path from 'path';

const argv = minimist(process.argv.slice(2));

const input = argv.i || argv.input;

if (input) {
	const contents = fs.readFileSync(input, 'utf8');
	let {HTML, CSS, JS} = parse(contents);

	const output = (argv.o || argv.output || 'dist');
	fs.mkdir(output, () => {});

	HTML = HTML.replace(/<%(css|js)%>/g, 'bundle');

	fs.writeFile(path.resolve(output + '/index.html'), HTML, err => console.log(err || 'Wrote HTML'));
	fs.writeFile(path.resolve(output + '/bundle.css'), CSS, err => console.log(err || 'Wrote CSS'));
	fs.writeFile(path.resolve(output + '/bundle.js'), JS, err => console.log(err || 'Wrote JS'));
} else {
	console.error('No entry point was provided');
}
