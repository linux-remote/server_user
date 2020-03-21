const fs = require('fs');

function handleNormal(method, socket){
  socket.once('data', function(buffer){

    const filePath = buffer.toString();

    if(method === 'download'){
      fs.access(filePath, fs.constants.R_OK, (err) => {
        if(err){
          socket.end(JSON.stringify({
            status: 'error',
            message: err.message
          }));
          return;
        }

        fs.lstat(filePath, function(err, stat){
          
          if(err){
            socket.end(JSON.stringify({
              status: 'error',
              message: err.message
            }));
            return;
          }

          let resData = {
            status: 'success',
            data: {
              size: stat.size,
              mtime: stat.mtime.getTime()
            }
          }
          socket.write(JSON.stringify(resData));
          socket.once('data', () => {
            const stream = fs.createReadStream(filePath);
            stream.pipe(socket);
          });
        });

      });
      

    } else if(method === 'upload'){
      fs.access(filePath, fs.constants.W_OK, (err) => {
        if(err){
          socket.end(JSON.stringify({
            status: 'error',
            message: err.message
          }));
          return;
        }
        socket.end(JSON.stringify({
          status: 'success'
        }));
        const stream = fs.createWriteStream(filePath);
        socket.pipe(stream);
      });

    } else {
      socket.end('404');
    }
  })
}
module.exports = handleNormal;