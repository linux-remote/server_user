const Stream = require('stream');
const readline = require('readline');

function terminalPassThrough(_opt, callback){
  const opt = _opt || Object.create(null);
  const pass = new Stream.PassThrough();
  pass.pipe(process.stdout);
  var rlOpts = { input: process.stdin, output: pass, terminal: true }
  var rl = readline.createInterface(rlOpts);
  rl.setPrompt('TERMINAL_PASS_THROUGH_INPUT:');
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
  if(typeof _opt.timeout === 'number'){
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



terminalPassThrough({timeout: 5000, prompt: 'PassSid:'}, function(err, sid){
  if(err){
    console.error(`\n${err.name}: ${err.message}`);
    return;
  }
  console.log('sid', sid.toUpperCase());
});
