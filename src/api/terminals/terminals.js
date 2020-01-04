
// Copyright and modify form: https://github.com/xtermjs/xterm.js/blob/master/demo/server.js

const pty = require('node-pty');
const { terminals, logs } = require('./store');


// 
module.exports = function(app) {

  // resize
  app.post('/terminals/:pid/size', function (req, res) {
    var pid = parseInt(req.params.pid),
      cols = parseInt(req.query.cols),
      rows = parseInt(req.query.rows),
      term = terminals[pid];

    term.resize(cols, rows);
    //  _console.log('Resized terminal ' + pid + ' to ' + cols + ' cols and ' + rows + ' rows.');
    res.end('ok');
  });
  
  // 创建
  app.post('/terminals', function (req, res) {
    // process.platform === 'win32' ? 'cmd.exe' : 
    var cols = parseInt(req.query.cols),
      rows = parseInt(req.query.rows),
      term = pty.spawn('bash', [], {
        name: 'xterm-color',
        cols: cols || 80,
        rows: rows || 24,
        cwd: process.env.HOME,
        env: process.env
      });

    //  _console.log('Created terminal with PID: ' + term.pid);
    terminals[term.pid] = term;
    logs[term.pid] = '';
    term.on('data', function(data) {
      logs[term.pid] += data;
    });
    res.end(term.pid.toString());
  });



/*
  app.ws('/terminals/:pid', function (ws, req) {

    var term = terminals[parseInt(req.params.pid)];
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
            socket.send(s);
            s = '';
            sender = null;
          }, timeout);
        }
      };
    }
    const send = buffer(ws, 5);

    term.on('data', function(data) {
      try {
        send(data);
      } catch (ex) {
        // The WebSocket is not open, ignore
      }
    });
    ws.on('message', function(msg) {
      term.write(msg);
    });
    ws.on('close', function () {
      term.kill();
      // _console.log('Closed terminal ' + term.pid);
      // Clean things up
      delete terminals[term.pid];
      delete logs[term.pid];
    });
  }); 
  */
}