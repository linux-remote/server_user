const {execSync} = require('child_process');
const fs = require('fs');

const net = require('net');

const { genUserServerFlag } = require('./lib/util');

let flags = genUserServerFlag();

const PORT = process.env.PORT;
// check PORT ? 
// const isUnixSocket = !Number(PORT);
// if(isUnixSocket) {
//   if(PORT.indexOf('/linux-remote') !== -1) {
//     'rm -rf -- ' + PORT; //删除旧的 sock 文件, 才能启动.
//   } else {
//     console.error('PORT path error');
//     console.info(ERROR_FLAG);
//     throw new Error('Port is not reasonable');
//   }
// }


const server = net.createServer(function(socket){
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
  errOut(err);
});

function errOut(e){
  if(flags){
    console.error(flags.ERR_FLAG_START + e.message + flags.ERR_FLAG_END);
  } else {
    console.error(e);
  }
}