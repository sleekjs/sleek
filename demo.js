import {parse} from './src/index.js';
import {sample2} from './sample.js'
import fs from 'fs';

let {HTML, CSS, JS} = parse(sample2);

HTML = HTML.replace(/<%(css|js)%>/g, 'bundle')

fs.writeFile('bundle/bundle.html', HTML, () => {});
fs.writeFile('bundle/bundle.css', CSS, () => {});
fs.writeFile('bundle/bundle.js', JS, () => {});
