// const os = require('os');
const {spawn} = require('child_process');
const WebSocket = require('ws');
const {DebounceTime} = require('../common/debounce-time');
const { safeSend } = require('./util');
const zlib = require('zlib');
const wsServer = new WebSocket.Server({ noServer: true });


wsServer.on('connection', function connection(ws) {
  console.log('ws-ps connection2');
  const l = spawn('top', ['-b']);
  let out = '';
  const debounce = new DebounceTime(function(){
    // 最后换行 \n 判定?
    // if(out[out.length])
    zlib.gzip(out, function(err, result){
      if(err){
        ws.close(1000, err.message);
      } else {
        safeSend(ws, result);
      }
      out = '';
    })

  }, 500);

  l.stdout.on('data', function(buffer) {
    // console.log('buffer', buffer);
    out += buffer;
    debounce.trigger();
  }) 
  l.on('exit', function(){
    // console.log('l exit');
    ws.terminate();
  });
  ws.on('close', function(){
    // console.log('ws close');
    l.kill();
  })
});

module.exports = function(req, socket, head) {
  wsServer.handleUpgrade(req, socket, head, function done(ws) {
    wsServer.emit('connection', ws);
  });
};
