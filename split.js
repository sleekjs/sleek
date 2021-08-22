module.exports = function split(code) {
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

	HTML = `
<!DOCTYPE html>
<html>
<head>
	<meta charset='UTF-8'>
	<title>My app</title>
	<link rel='stylesheet' href='<%css%>.css'>
</head>
<body>
${HTML}
<script src='<%js%>.js'></script>
</body>
</html>
	`.trim();

	return {HTML, CSS, JS};
}
