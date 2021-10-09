import {nanoid} from 'nanoid';
import {parseFragment as parseHTML, serialize as serializeHTML} from 'parse5';
import {parse as parseCSS, stringify as serializeCSS} from 'css';

/*
 * Scope the given component
 * @param {Object} code - The code to scope
 * @param {string} code.HTML - The HTML code
 * @param {string} code.CSS - The CSS code
 * @param {string} code.JS - The JS code
 * @return {Object} code - The scoped code
 * @return {string} code.HTML - The scoped HTML code
 * @return {string} code.CSS - The scoped CSS code
 * @return {string} code.JS - The scoped JS code
 */
export function scope(
	{HTML = '', CSS = '', JS},
	scopeName = nanoid(10).toLowerCase()
) {
	const id = 'sleek-' + scopeName;

	const document = parseHTML(HTML);

	document.childNodes = document.childNodes.map(node => {
		if (node.nodeName == '#text') {
			node.nodeName = node.tagName = 'span';
			node.attrs = [];
			node.namespaceURI = 'http://www.w3.org/1999/xhtml';
			node.childNodes = [
				{
					nodeName: '#text',
					value: node.value,
					parentNode: node
				}
			];
			delete node.value;
			return node;
		}

		return node;
	});

	for (const node of document.childNodes
		.filter(node => !node.nodeName.startsWith('#'))) {
		node.attrs.push({name: id, value: ''});
	}

	HTML = serializeHTML(document);

	const CSSData = parseCSS(CSS);

	for (const rule of CSSData.stylesheet.rules) {
		if (rule.selectors) {
			rule.selectors = rule.selectors.map(selector => {
				const temporary = selector.split(/ (?![^[]*])/g);

				if (!/\[sleek-[\w-]+?]/g.test(selector)) {
					temporary[0] += `[${id}]`;
				}

				selector = temporary.join(' ');

				return selector;
			});
		}
	}

	CSS = serializeCSS(CSSData);

	return {HTML, CSS, JS};
}
