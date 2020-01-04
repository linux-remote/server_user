
const url = require('url');
const WebSocket = require('ws');
const { terminals, logs } = require('./store');
const { safeSend } = require('../util');
const wsServer = new WebSocket.Server({ noServer: true });

wsServer.on('connection', function connection(ws, req) {
  const parsed = url.parse(req.url, true);
  const pid = parsed.query.pid;
  //  _console.log('pid', parsed.query.pid);
  // ws.on('message', function incoming(message) {
  //  _console.log('received: %s', message);
  // });


  var term = terminals[pid];
  // _console.log('Connected to terminal ' + term.pid);
  //  _console.log('logs[term.pid] ' + logs[term.pid]);
  ws.send(logs[term.pid]);

  function buffer(socket, timeout) {
    let s = '';
    let sender = null;
    return (data) => {
      s += data;
      if (!sender) {
        sender = setTimeout(() => {
          //Error: websocket is not open: readyState 3

          safeSend(socket, s);
          s = '';
          sender = null;
        }, timeout);
      }
    };
  }
  const send = buffer(ws, 5);

  term.on('data', function(data) {
    send(data);
    // try {
      
    // } catch (ex) {
    //   // The WebSocket is not open, ignore
    // }
  });
  ws.on('message', function(msg) {
    term.write(msg);
  });

  ws.on('close', function () {
    term.kill();
    // _console.log('Closed terminal ' + term.pid);
    // Clean things up
  });

  term.on('exit', function() {
    ws.close();
    delete terminals[term.pid];
    delete logs[term.pid];
  });
});



module.exports = function(req, socket, head) {
  wsServer.handleUpgrade(req, socket, head, function done(ws) {
    wsServer.emit('connection', ws, req);
  });
}
