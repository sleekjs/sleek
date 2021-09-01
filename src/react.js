import {parse, print, visit, types} from 'recast';

const b = types.builders;

export function react(JS) {
	const ast = parse(JS);

	visit(ast, {
		/* visitIdentifier: createPrefix,
		visitMemberExpression: createPrefix */
	});

	return print(ast).code;
}

/*
function createPrefix(path) {
	if (
		path.parentPath.value.type !== 'VariableDeclarator' &&
		(path.parentPath.value.type !== 'Property' || path.name === 'value') &&
		path.parentPath.value.type !== 'LabeledStatement' &&
		path.scope.isGlobal
	) {
		path.replace(b.memberExpression(
			b.identifier('scope'),
			path.node,
			false
		));

		return false;
	}

	this.traverse(path);
}
*/

console.log(react(`
const foo = 1;
doSomethingWith(foo);

$: console.log(foo * 2);

// later...
foo = 10;
`.trim()))
