import {parse, print, types, visit} from 'recast';
import {hasEmbeddedVariable} from './detect-embeds.js';
import {resolveEmbeds, directEmbed} from './resolve-embeds.js'

const {builders: b} = types;
let deps = {};
let depsInverted = false;
let HTML = '';
let finalReactiveCalls = [];

export function makeReactive({HTML: HTMLIn, JS}) {
	HTML = HTMLIn;

	const ast = parse(JS);

	visit(ast, {
		visitUpdateExpression: visitUpdate,
		visitVariableDeclaration: visitVariable
	});

	// It works. Don't touch
	visit(ast, {
		visitVariableDeclaration: secondVisitVariable
	});

	visit(ast, {
		visitVariableDeclaration: bindConsts
	});

	ast.program.body.push(...finalReactiveCalls);

	JS = print(ast).code;
	HTML = resolveEmbeds(HTMLIn);

	return {HTML, JS};
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

					hasEmbeddedVariable(HTML, declaration.id.name) ?
						parse(`document.getElementById('__bind__${declaration.id.name}').innerText = ${declaration.id.name}`).program.body[0] : b.emptyStatement(), // I'm lazy

					...(deps[declaration.id.name] || []).map(
						dep => b.expressionStatement(
							b.callExpression(b.identifier(`__update__${dep}`), [])
						)
					)
				])
			),
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
		HTML = directEmbed(HTML, declaration.id.name, eval(print(declaration.init).code))
	}

	path.replace(path.node, ...reactiveDeclarators);

	return false;
}
