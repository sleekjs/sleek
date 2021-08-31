import {split} from './split.js';
import {resolve} from './resolve.js';

/*
 * Parse a component
 * @param {string} code - The code to parse
 * @param {Object} [options] - The options to pass to the parser
 * @param {boolean} [options.wrapInHTML] - Whether to wrap the output HTML in a template
 * @param {string} [options.HTMLTemplate] - The custom template to wrap the HTML in
 * @return {Object} code - The parsed code
 * @return {string} code.HTML - The parsed HTML code. Replace `<%css|js%>` with the correct import path
 * @return {string} code.CSS - The parsed CSS code
 * @return {string} code.JS - The parsed JS code
 */
export function parse(code = '', options = {}) {
	let {HTML, CSS, JS} = resolve(split(code, true));

	if (options.wrapInHTML) {
		if (options.HTMLTemplate) HTML = options.HTMLTemplate.replace('<%html%>', HTML.split('\n').map(line => '\t' + line).join('\n'));
		else HTML = `
<!DOCTYPE html>
<html>
<head>
	<meta charset='UTF-8'>
	<title>My app</title>
	<link rel='stylesheet' href='<%css%>.css'>
</head>
<body>
${HTML.split('\n').map(line => '\t' + line).join('\n')}
	<script src='<%js%>.js'></script>
</body>
</html>
		`.trim();
	}


	return {HTML, CSS, JS};
}

