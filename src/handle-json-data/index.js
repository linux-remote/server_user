
const os = require('os');
const SocketRequest = require('../../../socket-request/index.js');

const quickLaunch = require('./quick-launch.js');
const desktop = require('./desktop.js');

const methodsMap = Object.create(null);
Object.assign(methodsMap, quickLaunch);
Object.assign(methodsMap, desktop);

function handleJsonData(socket){
  const sr = new SocketRequest(socket);
  sr.onRequest = function(data, reply){
    console.log('onRequest', data)
    const method = data.method;
    if(method === 'getDesktopBundle'){
      
      const userInfo = os.userInfo();
      // uid, gid, username, homedir, shells
      reply({
        status: 200,
        data: {
          ...userInfo,
          hostname: os.hostname()
        }
      });
    } else if(method === 'getTime') {
      const d = new Date();
      reply({
        status: 200,
        data: {
          timeZoneOffset: d.getTimezoneOffset(),
          time: d.getTime()
        }
      });
    } else if(methodsMap[method]) {

      methodsMap[method](data.data, function(err, data){
        if(err){
          reply({
            status: err.status || 400,
            message: err.name + ': ' + err.message
          });
          return;
        } else {
          reply({
            status: 200,
            data
          });
        }
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
