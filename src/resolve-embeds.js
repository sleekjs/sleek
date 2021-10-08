export function resolveEmbeds(HTML) {
	// Variables
	HTML = HTML.replace(/(?<!{){([^}]+)}(?!})/g, (_match, $1) => `<span id='__bind__${$1}'></span>`);

	// TODO: if, for, switch

	return HTML;
}

export function directEmbed(HTML, variable, value) {
	return HTML.replace(/(?<!{){([^}]+)}(?!})/g, (match, $1) => $1 === variable ? value : match);
}
