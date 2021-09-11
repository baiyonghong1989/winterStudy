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
        resp.end(`<html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Document</title>
        </head>
        <body>
          <div class="testStyle">test1</div>
        </body>
        <style>
          div.testStyle {
            width: 200px;
            height: 300px;
            background-color: rgb(189, 120, 120);
          }
        </style>
      </html>
        `);
      });
  })
  .listen(888);
