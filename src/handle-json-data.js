
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
}

module.exports = handleJsonData;
