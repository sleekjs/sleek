const recast = require('recast');
const fs = require('fs');

const split = require('./split');

const b = recast.types.builders;

module.exports = function resolve({HTML = '', CSS = '', JS = ''}) {
	const ast = recast.parse(JS);

	recast.visit(ast, {
		visitImportDeclaration(path) {
			const name = path.node.specifiers[0].local.name;
			const tagRegex = new RegExp(`(<${name}><\/${name}>|<${name}\/?>)`, 'g');

			if (!tagRegex.test(HTML)) {
				// unused component
				path.replace(b.emptyStatement());
				return false;
			}

			const {HTML: _HTML, CSS: _CSS, JS: _JS} = split(fs.readFileSync(path.node.source.value, 'utf8'));

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

	JS = recast.print(ast).code;

	return {HTML, CSS, JS}
} 
