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
          <style>
          body .testClass {
            width: 200px;
            height: 300px;
            background-color: rgb(189, 120, 120);
          }
          #testId{
            width: 200px;
            height: 300px;
            background-color: yellow;
          }
          body{
            font-fize:18px;
            background-color:white;
          }
          #mixTestId{
            height:200px;
            width:300px;
            font-size:18px;
          }
          .mixTestClass{
            width:500px;
            font-size:25px;
            background-color:blue;
          }
        </style>
        </head>
        <body>
          <div class="testClass1 testClass">testClass</div>
          <div id="testId">testID</div>
          <div id="mixTestId" class="mixTestClass">mixText</div>
        </body>
      </html>
        `);
      });
  })
  .listen(888);
