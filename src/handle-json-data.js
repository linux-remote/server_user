
const os = require('os');

function handleJsonData(socket, data){
  const d = new Date();
  function _send(data){
    socket.write(JSON.stringify({
      method: data.method,
      data
    }));
  }
  if(data.method === 'getDesktopBundle'){
    const d = new Date();
    const userInfo = os.userInfo();
    // uid, gid, username, homedir, shells
    _send({
      timeZoneOffset: d.getTimezoneOffset(),
      time: d.getTime(),
      ...userInfo,
      hostname: os.hostname()
    });
    
  } else {
    socket.end('not found');
  }
}

module.exports = handleJsonData;
