const Stream = require('stream');
const readline = require('readline');

function terminalPassThrough(_opt, callback){
  const opt = _opt || Object.create(null);
  if(!opt.prompt){
    throw new Error('terminalPassThrough required a prompt.');
  }

  var rlOpts = { input: process.stdin, output: process.stdout, terminal: true, prompt: opt.prompt }
  var rl = readline.createInterface(rlOpts);
  rl.prompt();
  const pass = new Stream.PassThrough();
  pass.pipe(process.stdout);
  rl.output = pass;
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

module.exports = terminalPassThrough;



