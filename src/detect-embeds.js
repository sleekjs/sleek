export function hasEmbeddedVariable(HTML, variable) {
	return new RegExp(`{${variable}}|{{.*${variable}.*}}`, 'g').test(HTML);
}
