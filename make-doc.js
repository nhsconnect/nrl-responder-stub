const showdown = require('showdown');
const fs = require('fs');
const path = require('path');

const converter = new showdown.Converter();
converter.setFlavor('github');

const md = fs.readFileSync(path.join(__dirname, 'src', 'README.md'), 'utf8');

const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>README</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/3.0.1/github-markdown.min.css">
    <style>
        .markdown-body {
            box-sizing: border-box;
            min-width: 200px;
            max-width: 980px;
            margin: 0 auto;
            padding: 45px;
        }

        @media (max-width: 767px) {
            .markdown-body {
                padding: 15px;
            }
        }
    </style>
</head>
<body class="markdown-body">${converter.makeHtml(md)}</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'dist', 'README.html'), html);
