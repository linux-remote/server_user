const ls = require('../src/handle-json-data/fs/readdir');
const path = require('path');
ls(path.join(__dirname, '../'), function(err, files){
  if(err){
    console.error('err', err);
  } else {
    console.log('success');
    console.log('files', files);
  }
});