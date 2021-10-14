import HTMLHandler from 'https://dev.jspm.io/parse5';
import {nanoid} from 'https://deno.land/x/nanoid@v3.0.0/mod.ts';

export function parseEvents({HTML, CSS, JS}) {
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
			const name = attr.name.toLowerCase();

			if (name.startsWith('on')) {
				console.log('Got event!!');
				const eventSlug = `handle-${name.slice(2)}-${attr.value.replace(/[[\](){}'"]*/gi, '')}-${nanoid(5)}`;

				JS += '\n\n';
				JS += `
document.getElementById('${eventSlug}').addEventListener('${name.slice(2)}', function () {
	${attr.value}
});
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
