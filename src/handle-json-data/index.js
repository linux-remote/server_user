
const os = require('os');
const termMap = require('./terminal/store.js');
const SocketRequest = require('../../../socket-request/index.js');

const quickLaunch = require('./quick-launch.js');
const desktop = require('./desktop.js');
const fsMethods = require('./fs/index.js');
const termMethods = require('./terminal/term.js');
const methodsMap = Object.create(null);
Object.assign(methodsMap, quickLaunch);
Object.assign(methodsMap, desktop);
Object.assign(methodsMap, fsMethods);
Object.assign(methodsMap, termMethods);

function handleJsonData(socket){
  socket.setEncoding('utf-8');
  
  global.__isWsConnect = true;
  const sr = new SocketRequest(socket);
  global.__SOCKET_REQUEST__ = sr;
  sr.onRequest = function(data, reply){
    // console.log('onRequest', data);
    if(Array.isArray(data)){
      const type = data[0];
      if(type === 2){
        methodsMap.termWrite(data[1], data[2]);
      }
      return;
    }
    const method = data.method;
    if(method === 'getDesktopBundle'){
      const userInfo = os.userInfo();
      // uid, gid, username, homedir, shells
      reply({
        status: 200,
        data: {
          ...userInfo,
          hostname: os.hostname(),
          createdTerm: Object.keys(termMap)
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
    } else if(method === 'logout') {
      reply({
        status: 200,
        data: 'ok'
      });
      socket.end(function(){
        process.exit();
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
