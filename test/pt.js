const terminalPassThrough = require('./terminal-pass-through.js');

terminalPassThrough({timeout: 5000, prompt: 'PassSid:\n'}, function(err, sid){
  if(err){
    console.error(`\n${err.name}: ${err.message}`);
    return;
  }
  console.log('sid', sid);
});