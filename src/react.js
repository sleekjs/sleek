import {parse, print, types, visit} from 'recast';

const {builders: b, namedTypes: n} = types;

export function makeReactive(JS) {
	const ast = parse(JS);

	visit(ast, {
		visitExpressionStatement(path) {

			// TODO: when assignments are called together, update only once
			// Sample:
			// let a = 0;
			//
			// a++
			// a += 10;
			// =>
			// ...
			// a++
			// a += 10;
			// reactTo('a');
			if (n.AssignmentExpression.check(path.node.expression)) {
				path.replace(path.node, b.expressionStatement(
					b.callExpression(
						b.identifier('__reactTo'),
						[b.literal(path.node.expression.left.name)]
					)
				))
			}

			if (n.UpdateExpression.check(path.node.expression)) {
				path.replace(path.node, b.expressionStatement(
					b.callExpression(
						b.identifier('__reactTo'),
						[b.literal(path.node.expression.argument.name)]
					)
				))
			}

			this.traverse(path);
		},

		visitLabeledStatement(path) {
			if (path.node.label.name === '$') {
				path.replace(b.expressionStatement(
					b.callExpression(
						b.identifier('__labelled'),
						[b.functionExpression(
							null,
							[], // TODO dependencies
							b.blockStatement([path.node.body])
						)]
					))
				);
			}

			this.traverse(path);
		}
	});


	JS = print(ast).code;

	return JS;
}