const {execSync} = require('child_process');
const path = require('path');
const { FLAG, ERROR_FLAG } = require('./lib/util');

const PORT = process.env.PORT;
console.log('PORT', PORT);
if(PORT.indexOf('/linux-remote') !== -1) {
  execSync('rm -rf ' + PORT); //删除旧的 sock 文件, 才能启动.
} else {
  console.error(ERROR_FLAG);
  throw new Error('port is not reasonable');
}

const NODE_ENV = process.env.NODE_ENV;
const IS_PRO = NODE_ENV === 'production';
global.IS_PRO = IS_PRO;

const LR_PATH = path.join(process.env.HOME, 'linux-remote');
global.LR_PATH = LR_PATH;
global.DESKTOP_PATH = path.join(LR_PATH , 'desktop');
global.RECYCLE_BIN_PATH = path.join(LR_PATH , '.recycle-bin');


const http = require('http');
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const eStatic = require('express').static;

const { onListening, onError } = require('./lib/util');
const createWsSerever = require('./ws-server');
const middleWare = require('./common/middleware');

const serverInfo = require('./api/server-info');
const recycleBin = require('./api/recycle-bin');
const fsApi = require('./api/fs');
const disk = require('./api/disk');
const upload = require('./api/fs/upload');
const terminals = require('./api/terminals/terminals');
const desktop = require('./api/desktop');
const time = require('./api/time');
const ps = require('./api/ps/ps');

//初始化用户文件
execSync('mkdir -m=755 -p ' + global.DESKTOP_PATH);
execSync('mkdir -m=755 -p ' + global.RECYCLE_BIN_PATH);



var app = express();
app.disable('x-powered-by');



if(!IS_PRO) {
  app.use(logger('dev'));
}

terminals(app);

app.use('/upload', middleWare.preventUnxhr, upload);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


//================= 用户进程 TTL =================
// var _ttpMin = 15;
// if(!global.IS_PRO){
//   _ttpMin = 1000;
// }
// const TTL_MAX_AGE = 1000 * 60 * _ttpMin;

// var now = Date.now();

// console.log('[Process TTL] start at: ' + 
//             timeFormat() + 
//             '  maxAge: ' + 
//             ((TTL_MAX_AGE / 1000) / 60)  + 
//             ' minute.');

// const TTL = function(){
//   setTimeout(() =>{
//     if(Date.now() - now >= TTL_MAX_AGE){
//       console.log('[Process TTL] process.exit by TTL end.' + timeFormat());
//       normalExit();
//     }else{
//       TTL();
//     }
//   }, TTL_MAX_AGE);
// }

// app.use(function(req, res, next){
//   now = Date.now();
//   next();
// });
//================= 用户进程 TTL end =================


app.get('/', function(req, res){
  var msg = 'Hello! this is linux-remote user server!';
  res.send(msg);
});

app.get('/live', function(req, res){
  res.send('Y');
});

app.use('/time', middleWare.preventUnxhr, time);
app.use('/desktop', middleWare.preventUnxhr, desktop);

// sys apps

app.use('/fs', fsApi); // preventUnxhr inner.

app.use('/fs', eStatic('/', {dotfiles: 'allow', maxAge: 0}));
app.get('/disk',middleWare.preventUnxhr, disk);
app.use('/serverInfo', middleWare.preventUnxhr, serverInfo);
app.use('/recycleBin', middleWare.preventUnxhr, recycleBin);
app.use('/ps', middleWare.preventUnxhr, ps);
app.delete('/exit', function(req, res){
  res.send('exit');
  res.on('finish', function(){
    console.log('User server exit!');
    normalExit();
  });
});

// catch 404 and forward to error handler
app.use(middleWare.notFound);
// http error handler
app.use(middleWare.errHandle);

var server = http.createServer(app);
server.listen(PORT);

server.on('listening', onListening(server, function(){
  execSync('chmod 600 ' + PORT);
  console.log(FLAG);
}));

server.on('error', function(port) {
  console.log(ERROR_FLAG);
  onError(port);
});




function normalExit(){
  process.exit();
}


createWsSerever(server);
