import recast from 'https://dev.jspm.io/recast';
import {nanoid} from 'https://deno.land/x/nanoid@v3.0.0/mod.ts';

import {basename, extname} from 'https://deno.land/std@0.110.0/path/mod.ts';

import {split} from './split.js';
import {scope} from './scope.js';

const {parse, print, types, visit} = recast;
const b = types.builders;

/*
 * Resolve import statements in a component
 * @param {Object} code - An object containing the HTML, CSS and JS for the code
 * @param {string} code.HTML - The HTML code
 * @param {string} code.CSS - The CSS code
 * @param {string} code.JS - The JS code
 * @return {Object} code - The resolved code
 * @return {string} code.HTML - The resolved HTML code
 * @return {string} code.CSS - The resolved CSS code
 * @return {string} code.JS - The resolved JS code
 */
export function resolve({HTML = '', CSS = '', JS = ''}) {
	const ast = parse(JS);
	const props = {};

	visit(ast, {
		visitImportDeclaration(path) {
			const {name} = path.node.specifiers[0].local;
			const source = path.node.source.value;

			if (extname(source) === '.') {
				throw new Error('Could not resolve import with no extension');
			}

			if (extname(source) === '.js') {
				const imports = path.node.specifiers;
				const out = [];

				for (const _import of imports) {
					const fileIn = Deno.readTextFileSync(source);
					const fileAst = parse(fileIn);
					const name = (_import.imported ?? _import.local)?.name;

					let exportDefault = null, exportNamed = null;
					let allExports = [];

					visit(fileAst, {
						visitExportNamedDeclaration(path) {
							if (path.node.declaration.type === 'VariableDeclaration') {
								visit(path.node.declaration, {
									visitVariableDeclarator(path) {
										if (path.node.id.name === name) {
											exportNamed = path.node.init;
										}

										allExports.push({name: path.node.id, value: path.node.init});

										return false;
									}
								});
							} else {
								const {params, body} = path.node.declaration;
								if (path.node.declaration.id.name === name) {
									exportNamed = b.functionExpression(null, params, body);
								}

								allExports.push({name: path.node.declaration.id, value: b.functionExpression(null, params, body)});
							}

							return false;
						},
						visitExportDefaultDeclaration(path) {
							if (path.node.type === 'VariableDeclaration') {
								exportDefault = path.node.declaration;
							} else {
								const {params, body} = path.node.declaration;
								exportDefault = b.functionExpression(null, params, body);
							}

							allExports.push({name: b.identifier('default'), value: exportDefault});

							return false;
						}
					});

					if (_import.type === 'ImportNamespaceSpecifier') {
						console.log(_import.local.name);
						out.push(
							b.variableDeclaration('const', [
								b.variableDeclarator(
									_import.local,
									b.objectExpression([
										...allExports.map(item => b.property(
											'init',
											item.name,
											item.value
										))
									])
								)
							])
						);
						continue;
					}

					out.push(b.variableDeclaration('const', [
						b.variableDeclarator(
							_import.local,
							_import.type === 'ImportDefaultSpecifier' ?
								exportDefault : exportNamed
						)
					]));
				}

				path.replace(...out);

				return false;
			}

			if (extname(source) === '.sleek' && path.node.specifiers[0].type !== 'ImportDefaultSpecifier') {
				throw new Error('Only default importing components are allowed');
			}

			if (source === 'props') {
				props[name] = props[name] ?? [];
				return false;
			}

			const tagRegex = new RegExp(`<${name}\s*(.*?)><\/${name}>|<${name}\s*(.*?)\/>`, 'gi');

			if (!tagRegex.test(HTML)) {
				// Unused component
				path.replace();
				return false;
			}

			const {HTML: _HTML, CSS: _CSS, JS: _JS} = resolve(
				scope(
					split(
						Deno.readTextFileSync(path.node.source.value, 'utf8')
					),
					basename(path.node.source.value).replace(/\..*$/g, '') + '-' + nanoid(5)
				)
			);

			HTML = HTML.replace(tagRegex, (_match, $1, $2) => {
				const currProps = ($1 ?? $2)
					.trim()
					.split(' ')
					.map(item => item.split('='));

				for (const prop of currProps) {
					props[prop[0]] = props[prop[0]] ?? [];
					props[prop[0]].push(prop[1]);
				}

				return _HTML;
			});

			CSS += _CSS;

			path.replace(b.blockStatement(parse(_JS).program.body));
			return false;
		}
	});

	visit(ast, {
		visitImportDeclaration(path) {
			const name = path.node.specifiers[0].local.name;

			if (path.node.source.value === 'props') {
				path.replace(
					...(props[name] || []).map(prop => b.variableDeclaration(
						'const',
						b.identifier(prop[0]),
						b.literal(prop[1])
					))
				);
				return false;
			}

			return false;
		}
	});

	// Wrap in block statements

	({HTML, CSS, JS} = scope({HTML, CSS, JS}));

	JS = print(ast).code;

	return {HTML, CSS, JS};
}
