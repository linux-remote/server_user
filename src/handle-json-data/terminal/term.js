
// Copyright and modify form: https://github.com/xtermjs/xterm.js/blob/master/demo/server.js

const pty = require('node-pty');
const terminals = require('./store');

function termCreate(data, callback){
  data = data || Object.create(null);
  term = pty.spawn(global.__USER_INFO__.shell || 'bash', [], {
    name: 'xterm-256color',
    cols: data.cols || 80,
    rows: data.rows || 24,
    cwd: data.cwd || process.env.HOME,
    env: process.env
  });
  const id = term.pid.toString();
  terminals[id] = term;
  
  function buffer(timeout) {
    let s = '';
    let sender = null;
    return (data) => {
      s += data;
      if (!sender) {
        sender = setTimeout(() => {
          global.__SOCKET_REQUEST__.request({
            type: 'term',
            id,
            data: s
          });
          s = '';
          sender = null;
        }, timeout);
      }
    };
  }
  const send = buffer(5);

  callback(null, id);

  term.on('data', function(data) {
    try {
      send(data);
    } catch (ex) {
      // The WebSocket is not open, ignore
    }
  });

  term.once('exit', function(){

    global.__SOCKET_REQUEST__.request({
      type: 'term',
      id,
      method: 'exit'
    });
    delete(terminals[id]);
  });
}

function termWrite(data){
  let term = terminals[data.id];
  if(term){
    term.write(data.data);
  }
}

function termResize(data, callback){
  var id = parseInt(data.id),
  cols = parseInt(data.cols),
  rows = parseInt(data.rows),
  term = terminals[id];
  term.resize(cols, rows);
  callback(null, 'ok');
}

function termKill(id, callback){
  let term = terminals[id];
  if(term){
    term.kill();
  }
  callback(null);
}

module.exports = {
  termCreate,
  termResize,
  termWrite,
  termKill
}
