import {visit, types, parse, print} from 'recast';
import {nanoid} from 'nanoid';

import fs from 'fs';
import {basename} from 'path';

import {split} from './split.js';
import {scope} from './scope.js';

const b = types.builders;

/*
 * Resolve import statements in a component
 * @param {Object} code - An object containing the HTML, CSS and JS for the code
 * @param {string} code.HTML - The HTML code
 * @param {string} code.CSS - The CSS code
 * @param {string} code.JS - The JS code
 * @return {Object} code - The resolved code
 * @return {string} code.HTML - The resolved HTML code
 * @return {string} code.CSS - The resolved CSS code
 * @return {string} code.JS - The resolved JS code
 */
export function resolve({HTML = '', CSS = '', JS = ''}) {
	const ast = parse(JS);

	({HTML, CSS, JS} = scope({HTML, CSS, JS}));

	visit(ast, {
		visitImportDeclaration(path) {
			const name = path.node.specifiers[0].local.name;
			const tagRegex = new RegExp(`<${name}\s*(.*?)><\/${name}>|<${name}\s*(.*?)\/>`, 'gi');

			if (!tagRegex.test(HTML)) {
				// unused component
				path.replace();
				return false;
			}

			const {HTML: _HTML, CSS: _CSS, JS: _JS} = resolve(
				scope(
					split(
						fs.readFileSync(path.node.source.value, 'utf8')
					),
					basename(path.node.source.value).replace(/\..*$/g, '') + '-' + nanoid(5)
				)
			);

			HTML = HTML.replace(tagRegex, (_match, $1, $2) => {
				let props = $1 ?? $2; // TODO use props
				return _HTML;
			});

			CSS += _CSS;

			path.replace(b.blockStatement(parse(_JS).program.body))
			return false;
		}
	});

	// Wrap in block statements
	// TODO better way
	ast.program.body = ast.program.body.map(node => ({
		body: [node],
		loc: null,
		type: 'BlockStatement',
		comments: null,
		directives: []
	}));

	JS = print(ast).code;

	return {HTML, CSS, JS}
}
