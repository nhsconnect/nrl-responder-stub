{
    
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

// const data = process.argv[2];

// TODO un-hard-code
const data: any = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'logs/2019-12-03-11-43-25.json'), 'utf8')
);

const fmtHeaders = (headers: object) => {
    const h: { name: string, value: string }[] = [];
    
    Object.entries(headers).forEach(([_name, value]) => {

        const name = _name.replace(/\b[a-z]/g, m => m.toUpperCase()).replace(/id\b/, 'Id');

        h.push({ name, value });
    });

    return h;
};

data.logs.forEach((log: any) => {

    // TODO

    log.req.headers = fmtHeaders(log.req.headers);
    log.res.headers = fmtHeaders(log.res.headers);

});

fs.readFile(path.join(__dirname, 'static/report-template.html'), 'utf-8', (error: any, source: any) => {
    const template = handlebars.compile(source);
    const html = template(data);

    // TODO
    fs.writeFile('.junk.html', html, () => console.log(1));
    // console.log(html);
});

}