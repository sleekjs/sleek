import {parse, print, types, visit} from 'recast';

const {builders: b, namedTypes: n} = types;

export function makeReactive(JS) {
	const ast = parse(JS);

	function visitUpdate(path) {
		console.log(print(path).code);
		console.log();

		path.replace(
			b.blockStatement([
				b.expressionStatement(path.node),
				b.expressionStatement(
					b.callExpression(
						b.identifier('__update__' + path.node.argument.name),
						[]
					)
				)
			])
		);
		return false;
	}

	visit(ast, {
		visitUpdateExpression: visitUpdate
	});

	JS = print(ast).code;

	return JS;
}
