const fs = require('fs');
const net = require('net');
const crypto = require('crypto');
const { execSync } = require('child_process');
const base64ToSafe = require('base64-2-safe');

const handleJsonData = require('./handle-json-data/index.js');
const handleNormal = require('./handle-normal.js');
const { genUserServerFlag } = require('./lib/util');

let serverTimeoutTimer;
let flags = genUserServerFlag();
const CONF = global.CONF;
const userInfo = global.__USER_INFO__;

if(!userInfo.homedir){
  _errOut('Error: not have homedir');
  return;
}
if(userInfo.homedir === '/'){
  _errOut('Error: homedir cannot be ' + userInfo.homedir);
  return;
}

try {
  fs.statSync(CONF.hiddenRootDir);
} catch(err){
  if(err.code === 'ENOENT'){
    try {
      fs.mkdirSync(CONF.hiddenRootDir);
      fs.mkdirSync(global.RECYCLE_BIN_PATH);
    } catch(err) {
      _errOut(err.name + ": " + err.message);
      return;
    }
  } else {
    _errOut(err.name + ": " + err.message);
    return;
  }
}

const PORT = global.__TMP_DIR__ + '/linux-remote/' + CONF.sidHash + '.' + userInfo.username;

let sidCache;
function verifySid(sid){
  if(typeof sid !== 'string'){
    return false;
  }
  if(sidCache){
    return sidCache === sid;
  }
  const hash = _hashSid(sid);
  if(hash === CONF.sidHash){
    sidCache = sid;
    return true;
  }
  return false;
}

const server = net.createServer(function(socket){
  
  socket.setNoDelay(true);
  socket.once('data', function(buffer){
    data = buffer.toString().split(' ');
    sid = data[0];
    method = data[1];
    if(!verifySid(sid)){
      socket.end('not verify');
    } else {
      socket.write('ok', function(){
        if(!method){ // main socket
          if(serverTimeoutTimer){
            console.log('Clear server timeout timer.');
            clearTimeout(serverTimeoutTimer);
            serverTimeoutTimer = null;
          }
          socket.setTimeout(global._AFR_TIMEOUT__);
          socket.on('timeout', () => {
            global.__SOCKET_REQUEST__.request([CONF.arrSrExitKey, 'timeout']);
            console.log('socket timeout');
            socket.off('close', startServerTimeout);
            socket.end(() => {
              console.log('\n----------------- process.exit -----------------\n');
              process.exit();
            });
          });
        
          socket.on('close', startServerTimeout);

          handleJsonData(socket);
        } else {
          handleNormal(method, socket);
        }
        socket.on('error', function(err){
          console.error(err);
        });
      });
    }
  });



});



server.listen(PORT);

server.on('listening', function(){
  execSync('(chmod 600 -- ' + PORT + ') && (setfacl -m u:linux-remote:rw -- ' + PORT + ')');
  console.info(flags.START_FLAG);
  flags = null;
});

server.on('error', (err) => {
  server.close();
  if (err.code === 'EADDRINUSE') {
    fs.unlinkSync(PORT);
    server.listen(PORT);
    return;
  }
  if(flags){
    _errOut(err.name + ": " + err.message);
  } else {
    throw err;
  }
});

['SIGINT', 'SIGTERM', 'SIGHUP'].forEach(k => {
  process.on(k, () => {
    process.exit(1);
  });
});

process.on('exit', function(){
  try {
    fs.unlinkSync(PORT);
  } catch(e){
    console.error('Userserver unlink PORT error');
    console.error(e);
  }
});

function startServerTimeout(){
  serverTimeoutTimer = setTimeout(() => {
    serverTimeoutTimer = null;
    console.error('No main connect, server timeout.');
    process.exit();
  }, global._AFR_TIMEOUT__);
}

startServerTimeout();

function _errOut(message){
  console.error(flags.ERR_FLAG_START + message + flags.ERR_FLAG_END);
}

function _hashSid(sid){
  let hash = crypto.createHash('sha256').update(sid).digest('base64');
  return base64ToSafe(hash);
}
