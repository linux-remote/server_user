const path = require('path')
const openLoopDir = require('../src/handle-json-data/fs/open-loop-dir');

openLoopDir({
  cwd: path.join(__dirname, '../'),
  all: false
}, function(err, result){
  if(err){
    return console.log('error', err);
  }
  console.log('result', result)
})