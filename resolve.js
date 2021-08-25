import recast from 'recast';
import fs from 'fs';

import {split} from './split.js';
import {scope} from './scope.js';

const b = recast.types.builders;

export function resolve({HTML = '', CSS = '', JS = ''}) {
	const ast = recast.parse(JS);

	recast.visit(ast, {
		visitImportDeclaration(path) {
			const name = path.node.specifiers[0].local.name;
			const tagRegex = new RegExp(`(<${name}><\/${name}>|<${name}\/?>)`, 'g');

			if (!tagRegex.test(HTML)) {
				// unused component
				path.replace()
				return false;
			}

			const {HTML: _HTML, CSS: _CSS, JS: _JS} = scope(split(fs.readFileSync(path.node.source.value, 'utf8')));

			HTML = HTML.replace(tagRegex, _HTML)

			CSS += _CSS;

			path.replace(
				b.blockStatement(
					recast.parse(_JS).program.body
				)
			)
			return false;
		}
	});

	({HTML, CSS, JS} = scope({HTML, CSS, JS}));

	JS = recast.print(ast).code;

	return {HTML, CSS, JS}
} 
