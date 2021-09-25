const http = require('http');
http
  .createServer((req, resp) => {
    let body = [];
    req
      .on('error', (err) => {
        console.log(err);
      })
      .on('data', (data) => {
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
        <style>
          .flexDiv {
            display: flex;
            width: 500px;
            height: 300px;
            background-color:rgb(255,255,255)
          }
          .item1 {
            width: 200px;
            height: 100px;
            background-color:rgb(255,0,0);
            border: 1px solid red;
          }
          .item2 {
            flex: 1;
            background-color:rgb(0,255,0);
          }
        </style>
        <body>
          <div class="flexDiv">
            <div class="item1">item1</div>
            <div class="item2">item1</div>
          </div>
        </body>
      </html>
        `);
      });
  })
  .listen(888);
