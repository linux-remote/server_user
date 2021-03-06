const pty = require('node-pty');
const LimitFrequency = require('../../common/limit-frequency');
const RecycleIndex = require('../../common/recycle-index');
const terminals = require('./store');
const recycleIndex = new RecycleIndex();

const maxSize = 5000;

function termCreate(data, callback){
  data = data || Object.create(null);
  const term = pty.spawn(global.__USER_INFO__.shell || 'bash', [], {
    name: 'xterm-256color',
    cols: data.cols || 80,
    rows: data.rows || 24,
    cwd: data.cwd || process.env.HOME,
    env: process.env
  });
  const id = recycleIndex.get();
  // const id = term.pid.toString();
  terminals[id] = term;
  let tmp = '';
  const lf = new LimitFrequency(function() {
    if(tmp){
      global.__SOCKET_REQUEST__.request([2, id, tmp]);
      tmp = '';
    }
  }, 30);

  
  term.on('data', (data) => {
    tmp = tmp + data;
    if(global.__isWsConnect){
      lf.trigger();
    } else {
      if(tmp.size > maxSize){
        tmp = '';
      }
    }
  });
  // function buffer(timeout) {
  //   let s = '';
  //   let sender = null;
  //   return (data) => {
  //     s += data;
  //     if (!sender) {
  //       sender = setTimeout(() => {
  //         global.__SOCKET_REQUEST__.request({
  //           type: 'term',
  //           id,
  //           data: s
  //         });
  //         s = '';
  //         sender = null;
  //       }, timeout);
  //     }
  //   };
  // }

  term.once('exit', function(){
    lf.end();

    global.__SOCKET_REQUEST__.request(['termExit', id]);
    
    tmp = null;
    delete(terminals[id]);
    recycleIndex.recycle(id);
  });

  callback(null, id);
}

// arr data.
function termWrite(id, strData){
  let term = terminals[id];
  if(term){
    term.write(strData);
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
