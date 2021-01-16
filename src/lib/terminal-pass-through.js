const Stream = require('stream');
const readline = require('readline');
const READY_MARK = 'TERMINAL_PASS_THROUGH_READY:';
function terminalPassThrough(_opt, callback){
  const opt = _opt || Object.create(null);
  const pass = new Stream.PassThrough();
  pass.pipe(process.stdout);
  var rlOpts = { input: process.stdin, output: pass, terminal: true, prompt: READY_MARK }
  var rl = readline.createInterface(rlOpts);
  rl.prompt();
  let password = '';

  function done(err){
    pass.unpipe();
    rl.close();
    if(err){
      return callback(err);
    }
    callback(null, password);
  }
  let timer;
  if(typeof opt.timeout === 'number'){
    timer = setTimeout(function(){
      done(new Error('passWordThrough timeout'));
    }, _opt.timeout);
  }
  pass.write = function(data){
    if(data === '\n' || data === '\r' || data === '\r\n'){
      if(timer){
        clearTimeout(timer);
      }
      done();
    } else {
      password = password + data;
    }
  };
}

terminalPassThrough.READY_MARK = READY_MARK;

module.exports = terminalPassThrough;



