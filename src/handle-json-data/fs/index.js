const fs = require('fs');
const readdir = require('./readdir.js');
const ls = require('./ls.js');
module.exports = {
  ls,
  readdir,
  readFile(filePath, callback){
    fs.readFile(filePath, 'utf-8', callback);
  },
  writeFile(data, callback){
    let flag;
    if(data.isCreate){
      // 'wx': Like 'w' but fails if the path exists.
      flag = 'wx';
    }
    fs.writeFile(data.filePath, data.content, {flag}, callback);
  },
  getRecycleBin(data, callback){
    ls({
      cwd: global.RECYCLE_BIN_PATH,
      noDir: true
    }, callback);
  }
}