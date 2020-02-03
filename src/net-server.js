const {execSync} = require('child_process');
const fs = require('fs');
const os = require('os');
const net = require('net');
const crypto = require('crypto');
const base64ToSafe = require('base64-2-safe');

const handleJsonData = require('./handle-json-data.js');

const { genUserServerFlag } = require('./lib/util');

const userInfo = os.userInfo();
let flags = genUserServerFlag();

function hashSid(sid){
  let hash = crypto.createHash('sha256').update(sid).digest('base64');
  return base64ToSafe(hash);
}
// const userTmpDir = os.tmpdir() + '/linux-remote/' + process.env.LR_SID_HASH + '.' + userInfo.username;

// try {
//   fs.mkdirSync(userTmpDir);
// } catch(e){
//   if(e.code !== 'EEXIST'){
//     throw e;
//   }
// }
// userInfo.userTmpDir = userTmpDir;
userInfo.sidHash = process.env.LR_SID_HASH;
global.CONF = userInfo;

const PORT = global.__TMP_DIR__ + '/linux-remote/' + userInfo.sidHash + '.' + userInfo.username;

let sidCache;
function verifySid(sid){
  if(typeof sid !== 'string'){
    return false;
  }
  if(sidCache){
    return sidCache === sid;
  }
  const hash = hashSid(sid);
  if(hash === userInfo.sidHash){
    sidCache = sid;
    return true;
  }
  return false;
}
const server = net.createServer(function(socket){
  socket.setEncoding('utf-8');
  socket.once('data', function(sid){
    
  console.log('once data', sid);
    if(!verifySid(sid)){
      socket.end('not verify');
    } else {
      socket.write('ok');

      socket.on('data', function(data){
        console.log('on data', data);
        let jsonData;
        try {
          jsonData = JSON.parse(data);
        } catch(e){
          jsonData = {
            method: data
          }
          // return socket.end(e.name + ': ' + e.message);
        }
    
        handleJsonData(socket, jsonData);
        
      });

    }
  });

  socket.on('error', function(err){
    console.log(err);
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
    console.error(flags.ERR_FLAG_START + e.message + flags.ERR_FLAG_END);
    process.exit(1);
  } else {
    throw e;
  }
});

['SIGINT', 'SIGTERM', 'SIGHUP'].forEach(k => {
  process.on(k, () => {
    process.exit(1);
  })
});

process.on('exit', function(){
  try {
    fs.unlinkSync(PORT);
  } catch(e){

  }
});