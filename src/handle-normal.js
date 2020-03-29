const fs = require('fs');
const {checkCoverByLstat} = require('./lib/fs-check-cover');
function handleNormal(method, socket){
  socket.once('data', function(buffer){

    const filePath = buffer.toString();

    if(method === 'download'){


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
          
          stream.on('error', function(err){
            if(!socket.destroyed){
              stream.unpipe(socket);
              try {
                socket.end(JSON.stringify({
                  status: 'error',
                  message: err.message
                }));
              } catch(e){
                console.error('download fail after steam error:', e);
              }
            }
            // stream.destroy();
          });
          stream.pipe(socket);
        });
      });

      

    } else if(method === 'upload'){
      checkCoverByLstat(filePath, (err) => {
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
        stream.on('error', function(err){
          if(!socket.destroyed){
            socket.unpipe(stream);
            try {
              socket.end(JSON.stringify({
                status: 'error',
                message: err.message
              }));
            } catch(e){
              console.error('upload fail after steam error:', e);
            }
          }
          // stream.destroy();
        });
        socket.pipe(stream);
      });

    } else {
      socket.end('404');
    }
  })
}
module.exports = handleNormal;