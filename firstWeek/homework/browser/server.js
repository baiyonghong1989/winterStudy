const http = require('http');
http
  .createServer((req, resp) => {
    let body = [];
    req
      .on('error', (err) => {
        console.log(err);
      })
      .on('data', (data) => {
        console.log('data');
        body.push(data);
      })
      .on('end', () => {
        console.log('end');
        body = Buffer.concat(body).toString();
        resp.writeHead(200, { 'content-type': 'text/html' });
        resp.end(`hello worldfawef`);
      });
  })
  .listen(80);
