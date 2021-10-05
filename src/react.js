import {parse, print, types, visit} from 'recast';

const {builders: b} = types;

export function makeReactive(JS) {
	const ast = parse(JS);

	visit(ast, {
		visitUpdateExpression: visitUpdate,
		visitVariableDeclaration: visitVariable
	});

	JS = print(ast).code;

	return JS;
}

function visitVariable(path) {
	// `const` is constant
	if (path.node.kind === 'const') return false;

	const reactiveDeclarators = [];

	for (const declaration of path.node.declarations) {
		console.log(declaration);
		reactiveDeclarators.push(b.functionDeclaration(
			b.identifier(`__update__${declaration.id.name}`),
			[],
			b.blockStatement([])
		));
	}

	path.replace(path.node, ...reactiveDeclarators);

	return false;
}

function visitUpdate(path) {
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
