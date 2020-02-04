import marked from 'marked';
import fs from 'fs';
import path from 'path';

marked.setOptions({
    smartypants: true,
});

const md = fs.readFileSync(path.join(__dirname, 'docs.md'), 'utf8');

const htmlTemplate = fs.readFileSync(path.join(__dirname, 'docs.template.html'), 'utf8');

const html = htmlTemplate.replace('{{md}}', marked(md));

fs.writeFileSync(path.join(__dirname, 'docs.html'), html);
