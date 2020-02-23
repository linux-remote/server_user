
const os = require('os');

const SocketRequest = require('../../socket-request/index.js');
function handleJsonData(socket){
  const sr = new SocketRequest(socket);
  sr.onRequest = function(data, reply){
    if(data.method === 'getDesktopBundle'){
      
      const userInfo = os.userInfo();
      // uid, gid, username, homedir, shells
      reply({
        status: 200,
        ...userInfo,
        hostname: os.hostname()
      });
    } else if(data.method === 'getTime') {
      const d = new Date();
      reply({
        status: 200,
        timeZoneOffset: d.getTimezoneOffset(),
        time: d.getTime()
      });
    } else {
      reply({
        status: 404,
        message: 'not found'
      });
    }
    
  }

  // function _send(data){
  //   socket.write(JSON.stringify({
  //     method: data.method,
  //     data
  //   }));
  // }
  // if(data.method === 'getDesktopBundle'){
  //   const d = new Date();
  //   const userInfo = os.userInfo();
  //   // uid, gid, username, homedir, shells
  //   _send({
  //     timeZoneOffset: d.getTimezoneOffset(),
  //     time: d.getTime(),
  //     ...userInfo,
  //     hostname: os.hostname()
  //   });
  //   _send({
  //     time: d.getTime()
  //   })
  //   _send({
  //     time: d.getTime()
  //   })
  //   _send({
  //     time: d.getTime()
  //   })
  // } else {
  //   socket.end('not found');
  // }
}

module.exports = handleJsonData;
