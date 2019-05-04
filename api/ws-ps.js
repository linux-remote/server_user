// const os = require('os');
const {spawn} = require('child_process');
const WebSocket = require('ws');
const {DebounceTime} = require('../common/debounce-time');
const { safeSend } = require('./util');

const wsServer = new WebSocket.Server({ noServer: true });


wsServer.on('connection', function connection(ws) {
  console.log('ws-ps connection');
  const l = spawn('top', ['-b']);
  let out = '';
  const debounce = new DebounceTime(function(){
    safeSend(ws, out);
    out = '';
  }, 200);

  l.stdout.on('data', function(buffer) {
    // console.log('buffer', buffer);
    out += buffer;
    debounce.trigger();
  }) 
});

module.exports = function(req, socket, head) {
  wsServer.handleUpgrade(req, socket, head, function done(ws) {
    wsServer.emit('connection', ws);
  });
};
