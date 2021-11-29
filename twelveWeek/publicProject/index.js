// const fs = require('fs');
const http = require('http');
const archiver = require('archiver');
const fs = require('fs');
const child_process = require('child_process');
let querystring = require('querystring');
const { url } = require('inspector');
const client_id = 'Iv1.5a12114b8887fab3';
child_process.exec(`start https://github.com/login/oauth/authorize?client_id=${client_id}`);
http
  .createServer(function (req, resp) {
    if(req.url.indexOf('fav')>=  0){
      resp.end('success ');
    } else {
      let query = querystring.parse(req.url.match(/^\/\?([\s\S]+)$/)[1]);
      publish(query.token);
    }

  })
  .listen(8083);

function publish(token) {
  let request = http.request(
    {
      hostname: '127.0.0.1',
      port: 8082,
      method: 'POST',
      path:'/publish?token=' + token,
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    },
    (resp) => {
      console.log({ ...resp });
    },
  );

  const archive = archiver('zip', {
    zlib: {
      level: 9,
    },
  });
  archive.directory('./sample', false);
  archive.finalize();
  archive.pipe(request);
}

// fs.stat('./sample/index.html', (err, stats) => {
//   let request = http.request(
//     {
//       hostname: '127.0.0.1',
//       port: 8082,
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/octet-stream',
//         'Content-Length': stats.size,
//       },
//     },
//     (resp) => {
//       console.log('resp publish', resp);
//     },
//   );
//   let file = fs.createReadStream('./sample/index.html');
//   file.pipe(request);
//   file.on('end', () => {
//     console.log('enmd')
//     request.end();
//   });
// });
