import marked from 'marked';
import fs from 'fs';
import path from 'path';

const md = fs.readFileSync(path.join(__dirname, 'src', 'README.md'), 'utf8');

const htmlTemplate = fs.readFileSync(path.join(__dirname, 'src', 'README.template.html'), 'utf8');

const html = htmlTemplate.replace('{{md}}', marked(md));

fs.writeFileSync(path.join(__dirname, 'src', 'README.html'), html);
