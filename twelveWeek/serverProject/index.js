let http = require('http');
let https = require('https');
let unzipper = require('unzipper');
let querystring = require('querystring');
const client_id = 'Iv1.5a12114b8887fab3';
const client_secret = '6254cc39015c79485106647886d223e469cda145';

// 2. auth 路由 ,接受code 用code+client_id + client_secret换token
function auth(req,resp){
  let query = querystring.parse(req.url.match(/\/auth\?([\s\S]+)$/)[1]);
  getToken(query.code,function(info){
    console.log(info);
    resp.write(`<a href='http://localhost:8083/?token=${info.access_token}'>publish</a>`);
    resp.end();
  })
}

function getToken(code,callBack){
  let req = https.request({
    hostname:'github.com',
    path:`/login/oauth/access_token?code=${code}&client_id=${client_id}&client_secret=${client_secret}`,
    port:443,
    method:'POST'
  },function(res){
    let body = '';
    res.on('data',chunk=>{
      body = body + chunk.toString()
    });
    res.on('end',()=>{
      callBack(querystring.parse(body));
    })
  });
  req.end();
}

// 4 publish路由 :用token获取用户信息，检查权限，接受发布
function publish(req,resp){
  let query = querystring.parse(req.url.match(/^\/publish\?([\s\S]+)$/)[1]);
  getUser(query.token,info=>{
    if (info.login === 'baiyonghong'){
      req.pipe(unzipper.Extract({
        path:'./public'
      }));
      req.on('end',function(){
        resp.end('success')
      })
    }
  })
}

function getUser(token,callBack){
  let req = https.request({
    hostname:'api.github.com',
    path:'/user',
    port:443,
    method:'GET',
    headers:{
      Authorization: `token ${token}`,
      'User-Agent':'toy-publish'
    }
  },function(res){
    let body = '';
    res.on('data',chunk=>{
      body += chunk.toString();
    })
    res.on('end',()=>{
      callBack(JSON.parse(body));
    })
  })
  req.end()
}

http.createServer((req,resp)=>{
  try{
    if (req.url.match(/^\/auth\?/)){
      return auth(req,resp);
    }
    if (req.url.match(/^\/publish\?/)){
      return publish(req,resp);
    }
  }catch (e){
    resp.end('haha')

  }

}).listen(8082)
