import HTMLHandler from 'https://dev.jspm.io/parse5';
import {nanoid} from 'https://deno.land/x/nanoid@v3.0.0/mod.ts';

export function parseAttributeBindings({HTML = '', CSS = '', JS = ''}) {
	const parsedHTML = HTMLHandler.parseFragment(HTML);

	function _parse(node) {
		if (node.nodeName.startsWith('#') && node.nodeName !== '#document-fragment') {
			return node;
		}

		node.childNodes = node.childNodes?.map(_parse);

		if (!node.attrs) {
			return node;
		}

		node.attrs = node.attrs.map(attr => {
			const {name, value} = attr;

			if (name.startsWith('{') && name.endsWith('}')) {
				const cleanName = name.slice(1, -1);
				const id = nanoid(5);
				const eventSlug = `handle-${cleanName}-${id}`;

				JS += '\n\n' + `
function __bind__attr__${cleanName}__${id}() {
	document.getElementById('${eventSlug}').setAttribute('${cleanName}', ${value || cleanName});
}
				`.trim();

				return ({name: 'id', value: eventSlug});
			}

			return attr;
		});

		return node;
	}

	const out = _parse(parsedHTML);

	HTML = HTMLHandler.serialize(out);

	return {HTML, CSS, JS};
}
