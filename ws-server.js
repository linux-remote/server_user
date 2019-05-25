const url = require('url');
const terminalHandle = require('./api/terminals/ws-terminal')
const psHandle = require('./api/ps/ws-ps');

// const MAX_AGE = 1000 * 60 * 15;
module.exports = function(server) {
  
  server.on('upgrade', function upgrade(req, socket, head) {
    const parsed = url.parse(req.url);
    switch(parsed.pathname){
      case '/terminal':
        terminalHandle(req, socket, head);
        break;
      case '/ps':
        psHandle(req, socket, head);
        break;
      default:
        socket.destroy();
    }
  });
}
