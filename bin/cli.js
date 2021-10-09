#!/usr/bin/env node
import {parse as parseArgs} from 'https://deno.land/std@0.110.0/flags/mod.ts';
import {ensureDir} from 'https://deno.land/std@0.110.0/fs/mod.ts';
import {resolve} from 'https://deno.land/std@0.110.0/path/mod.ts';
import {parse} from '../src/index.js';

const argv = parseArgs(Deno.args);

const input = argv.i || argv.input;

if (input) {
	const contents = Deno.readTextFileSync(input, 'utf8');
	let {HTML, CSS, JS} = parse(contents, {wrapInHTML: argv.wrap || argv.w || true});

	const output = (argv.o || argv.output || 'dist');
	await ensureDir(output);

	HTML = HTML.replace(/<%(css|js)%>/g, 'bundle');

	Deno.writeTextFile(resolve(output + '/index.html'), HTML);
	Deno.writeTextFile(resolve(output + '/bundle.css'), CSS);
	Deno.writeTextFile(resolve(output + '/bundle.js'), JS);
} else {
	console.error('No entry point was provided');
}
