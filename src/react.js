import recast from 'https://dev.jspm.io/recast';
import {resolveBindings, directlyBind, hasBinding} from './bindings.js';

const {parse, print, types, visit} = recast;
const {builders: b} = types;
let deps = {};
let depsInverted = false;
let HTML = '';
let ast = {};
const finalReactiveCalls = [];

export function makeReactive({HTML: HTMLIn, CSS, JS}) {
	HTML = HTMLIn;

	ast = parse(JS);

	visit(ast, {
		visitUpdateExpression: visitUpdate,
		visitVariableDeclaration: visitVariable
	});

	visit(ast, {
		visitVariableDeclaration: secondVisitVariable
	});

	visit(ast, {
		visitVariableDeclaration: bindConsts
	});

	ast.program.body.push(...finalReactiveCalls);

	JS = print(ast).code;
	HTML = resolveBindings(HTMLIn);

	return {HTML, CSS, JS};
}

function visitVariable(path) {
	// `const` is constant
	if (path.node.kind === 'const') {
		return false;
	}

	for (const declaration of path.node.declarations) {
		deps[declaration.id.name] ??= [];

		visit(declaration.init, {
			visitIdentifier(path) {
				// O(h no)
				deps[declaration.id.name].push(path.node.name);
				this.traverse(path);
			}
		});
	}

	return false;
}

function secondVisitVariable(path) {
	// `const` is constant
	if (path.node.kind === 'const') {
		return false;
	}

	if (!depsInverted) {
		deps = invert(deps);
	}

	depsInverted = true;

	const reactiveDeclarators = [];

	for (const declaration of path.node.declarations) {
		reactiveDeclarators.push(
			b.functionDeclaration(
				b.identifier(`__update__${declaration.id.name}`),
				[],
				b.blockStatement([
					hasMember(declaration) ? b.expressionStatement(
						b.assignmentExpression(
							'=',
							declaration.id,
							declaration.init
						)
					) : b.emptyStatement(),

					hasBinding(HTML, declaration.id.name) ?
						buildBinding(declaration.id.name) : b.emptyStatement(),

					hasAttributeBinding(declaration.id.name) ?
						b.expressionStatement(
							b.callExpression(b.identifier(hasAttributeBinding(declaration.id.name)), [])
						) : b.emptyStatement(),

					...(deps[declaration.id.name] || []).map(
						dep => b.expressionStatement(
							b.callExpression(b.identifier(`__update__${dep}`), [])
						)
					)
				])
			)
		);

		finalReactiveCalls.push(
			b.expressionStatement(
				b.callExpression(
					b.identifier(`__update__${declaration.id.name}`),
					[]
				)
			)
		);
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
					b.identifier(`__update__${path.node.argument.name}`),
					[]
				)
			)
		])
	);
	return false;
}

const invert = object => {
	const newObject = {};

	for (const key in object) {
		if (Object.prototype.hasOwnProperty.call(object, key)) {
			for (const value of object[key]) {
				newObject[value] = newObject[value] || [];
				newObject[value].push(key);
			}
		}
	}

	return newObject;
};

function hasMember(declaration) {
	let hasMember = false;
	visit(declaration.init, {
		visitIdentifier() {
			hasMember = true;
			return false;
		}
	});

	return hasMember;
}

function bindConsts(path) {
	// `let` already handled
	if (path.node.kind === 'let') {
		return false;
	}

	const reactiveDeclarators = [];

	for (const declaration of path.node.declarations) {
		HTML = directlyBind(HTML, declaration.id.name,
			eval(print(declaration.init).code)); // TODO no eval
	}

	path.replace(path.node, ...reactiveDeclarators);

	return false;
}

function buildBinding(name) {
	return b.expressionStatement(
		b.assignmentExpression(
			'=',
			b.memberExpression(
				b.callExpression(
					b.memberExpression(
						b.identifier('document'),
						b.identifier('getElementById')
					),
					[b.literal('__bind__' + name)]
				),
				b.identifier('innerText')
			),
			b.identifier(name)
		)
	);
}

function hasAttributeBinding(name) {
	let value = '';

	visit(ast, {
		visitFunctionDeclaration(path) {
			if (path.node.id.name.startsWith(`__bind__attr__${name}__`)) {
				value = path.node.id.name;
			}

			return false; // There will never be a nested fn we need
		}
	});

	return value;
}
