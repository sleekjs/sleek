import {parse, print, visit, types} from 'recast';
import chalk from 'chalk';

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
bar(foo);

$: console.log(foo * 2);

// later...
foo = 10;
foo++;
`.trim();

const changed = makeReactive(original);

console.log(changed, chalk.red('\n\n------\n\n'), original);
