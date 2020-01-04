const {execSync} = require('child_process');
const fs = require('fs');

const net = require('net');

const { FLAG, ERROR_FLAG } = require('./lib/util');

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

try {
  fs.unlinkSync(PORT); //删除旧的 socket 文件, 才能启动.
} catch(e){
  if(e.code !== 'ENOENT'){
    throw e;
  }
}

const server = net.createServer(function(socket){
  socket.end('hello user server!');
});

server.listen(PORT);

server.on('listening', function(){
  execSync('(chmod 600 -- ' + PORT + ') && (setfacl -m u:linux-remote:rw -- ' + PORT + ')');
  console.info(FLAG);
});

server.on('error', () => {
  // if (e.code === 'EADDRINUSE') {
  //   server.close();
  //   server.listen(PORT);
  // }
  console.error(ERROR_FLAG);
});
