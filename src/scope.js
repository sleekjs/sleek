import {nanoid} from 'nanoid';
import {parseFragment as parseHTML, serialize as serializeHTML} from 'parse5';
import {parse as parseCSS, stringify as serializeCSS} from 'css';

export function scope({HTML = '', CSS = '', JS}) {
	// Maybe store a counter?
	const id = 'fwrk-' + nanoid(10);

	const document = parseHTML(HTML);

	document.childNodes
		.filter(node => !node.nodeName.startsWith('#'))
		.forEach(node => node.attrs.push({name: id, value: ''}));

	HTML = serializeHTML(document);

	let CSSData = parseCSS(CSS);

	CSSData.stylesheet.rules.forEach(rule => {
		if (rule.selectors) rule.selectors = rule.selectors.map(selector => {
			let temp = selector.split(/ (?![^\[]*\])/g);

			temp[0] = temp[0] + `[${id}]`;
			selector = temp.join(' ');

			return selector;
		});
	});

	CSS = serializeCSS(CSSData);

	return {HTML, CSS, JS}
}
