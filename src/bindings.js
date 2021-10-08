const bindingRegex = /(?<!{){([^}]+)}(?!})/g;

export function resolveBindings(HTML) {
	// Variables
	HTML = HTML.replace(bindingRegex, (_match, $1) => `<span id='__bind__${$1}'></span>`);

	// TODO: if, for, switch

	return HTML;
}

export function directlyBind(HTML, variable, value) {
	return HTML.replace(bindingRegex, (match, $1) => $1 === variable ? value : match);
}

export function hasBinding(HTML, variable) {
	return new RegExp(`{${variable}}|{{.*${variable}.*}}`, 'g').test(HTML);
}
