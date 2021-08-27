import {nanoid} from 'nanoid';
import {parseFragment as parseHTML, serialize as serializeHTML} from 'parse5';
import {parse as parseCSS, stringify as serializeCSS} from 'css';

export function scope(
	{HTML = '', CSS = '', JS},
	scopeName = nanoid(10).toLowerCase()
) {
	// Maybe store a counter?
	const id = 'fwrk-' + scopeName;

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
		} else return node;
	});

	document.childNodes
		.filter(node => !node.nodeName.startsWith('#'))
		.forEach(node => node.attrs.push({name: id, value: ''}));

	HTML = serializeHTML(document);

	let CSSData = parseCSS(CSS);

	CSSData.stylesheet.rules.forEach(rule => {
		if (rule.selectors) rule.selectors = rule.selectors.map(selector => {
			console.log('selector', selector);
			let temp = selector.split(/ (?![^\[]*\])/g);

			if (!/\[fwrk-[A-Za-z0-9_-]+?\]/g.test(selector)) temp[0] = temp[0] + `[${id}]`;
			selector = temp.join(' ');

			console.log('new', selector);
			console.log()
			return selector;
		});
	});

	CSS = serializeCSS(CSSData);

	return {HTML, CSS, JS}
}
