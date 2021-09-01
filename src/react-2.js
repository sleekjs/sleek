import {parse, print, visit, types} from 'recast';
import chalk from 'chalk';
import diff from 'fast-diff';

const {builders: b} = types;

export function makeReactive(JS) {
	const ast = parse(JS);

	visit(ast, {
		visitExpressionStatement(path) {
			this.traverse(path);

			path.replace(
				b.expressionStatement(
					b.callExpression(
						b.identifier('__change'),
						[]
					)
				)
			);
		}
	});

	JS = print(ast).code;

	return JS;
}

const original = `
const foo = 1;
doSomethingWith(foo);

$: console.log(foo * 2);

// later...
foo = 10;
foo++;
`.trim();

const changed = makeReactive(original);

const d = diff(original, changed);

let whole = '';

d.forEach((part) => {
	const color = part[0] === 1 ? 'green' :
		part[0] == -1 ? 'red' : 'grey';
	whole += (chalk[color](part[1]));
});

console.log(whole)
