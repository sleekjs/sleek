import fs from 'node:fs';
import {visit, types, parse, print} from 'recast';
import {nanoid} from 'nanoid';

import {basename} from 'node:path';

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
	const props = {};

	visit(ast, {
		visitImportDeclaration(path) {
			const {name} = path.node.specifiers[0].local;
			const source = path.node.source.value;

			if (source === 'props') {
				props[name] = props[name] ?? [];
				return false;
			}

			const tagRegex = new RegExp(`<${name}\s*(.*?)><\/${name}>|<${name}\s*(.*?)\/>`, 'gi');

			if (!tagRegex.test(HTML)) {
				// Unused component
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
				const currProps = ($1 ?? $2)
					.trim()
					.split(' ')
					.map(item => item.split('='));

				for (const prop of currProps) {
					props[prop[0]] = props[prop[0]] ?? [];
					props[prop[0]].push(prop[1]);
				}
				console.log(props);

				return _HTML;
			});

			CSS += _CSS;

			path.replace(b.blockStatement(parse(_JS).program.body));
			return false;
		}
	});

	visit(ast, {
		visitImportDeclaration(path) {
			console.log('Visit import v2');
			const name = path.node.specifiers[0].local.name;

			if (path.node.source.value === 'props') {
				console.log(props);
				path.replace(
					...(props[name] || []).map(prop => b.variableDeclaration(
						'const',
						b.identifier(prop[0]),
						b.literal(prop[1])
					))
				);
				return false;
			}
		}
	});

	// Wrap in block statements

	({HTML, CSS, JS} = scope({HTML, CSS, JS}));

	JS = print(ast).code;

	return {HTML, CSS, JS};
}
