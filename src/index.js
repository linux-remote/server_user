const uspErrFlag = 'UNCAUGH_EXCEPTION';
process.on('uncaughtExceptionMonitor', function(){
  console.error(uspErrFlag);
});
const terminalPassThrough = require('./lib/terminal-pass-through.js');
require('./init.js');
const client = require('./net-client.js');

terminalPassThrough({timeout: 5000, prompt: 'PassSid:'}, function(err, sid){
  if(err){
    console.error(`\n${err.name}: ${err.message}`);
    return;
  }
  client(sid);
});
