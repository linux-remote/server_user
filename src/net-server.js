const {execSync} = require('child_process');
const fs = require('fs');
const os = require('os');
const net = require('net');

const { genUserServerFlag } = require('./lib/util');

const userInfo = os.userInfo();
let flags = genUserServerFlag();

const PORT = os.tmpdir() + '/linux-remote/' + process.env.LR_SID_HASH + '.' + userInfo.username;

const server = net.createServer(function(socket){
  console.log('user server start!');
  socket.end('hello user server!');
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
