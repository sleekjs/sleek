import {visit, types, parse, print} from 'recast';
import fs from 'fs';

import {split} from './split.js';
import {scope} from './scope.js';

const b = types.builders;

export function resolve({HTML = '', CSS = '', JS = ''}) {
	const ast = parse(JS);

	visit(ast, {
		visitImportDeclaration(path) {
			const name = path.node.specifiers[0].local.name;
			const tagRegex = new RegExp(`(<${name}><\/${name}>|<${name}\/?>)`, 'g');

			if (!tagRegex.test(HTML)) {
				// unused component
				path.replace();
				return false;
			}

			const {HTML: _HTML, CSS: _CSS, JS: _JS} = scope(split(fs.readFileSync(path.node.source.value, 'utf8')));

			HTML = HTML.replace(tagRegex, _HTML)

			CSS += _CSS;

			path.replace(b.blockStatement(parse(_JS).program.body))
			return false;
		}
	});

	// Wrap in block statements
	// TODO better way
	ast.program.body = ast.program.body.map(node => ({body: [node], loc: null, type: 'BlockStatement', comments: null, directives: []}));

	({HTML, CSS, JS} = scope({HTML, CSS, JS}));

	JS = print(ast).code;

	return {HTML, CSS, JS}
} 
