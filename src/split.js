/*
 * Split a component
 * @param {string} code - The code to split
 * @return {Object} code - The split code
 * @return {string} code.HTML - The split HTML code
 * @return {string} code.CSS - The split CSS code
 * @return {string} code.JS - The split JS code
 */
export function split(code) {
	let HTML = code, CSS = '', JS = '';

	HTML = HTML.replace(/<script[\s\S]*?>([\s\S]*?)<\/script>/gi, (_match, $1) => {
		JS += '\n\n' + $1; // safety
		return '';
	});

	HTML = HTML.replace(/<style[\s\S]*?>([\s\S]*?)<\/style>/gi, (_match, $1) => {
		CSS += '\n\n' + $1;
		return '';
	});

	// Trim extra newlines
	JS = JS.trim();
	CSS = CSS.trim();
	HTML = HTML.trim();

	return {HTML, CSS, JS};
}
