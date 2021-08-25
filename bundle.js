{}
const name = 'world';

function getColor(text) {
    return '#' + text.toLowerCase().slice(0, 6).padEnd(6, 0).replace(/[^0-9a-f]/g, 0);
}

let seconds = 0;

setInterval(() => seconds++, 1000)