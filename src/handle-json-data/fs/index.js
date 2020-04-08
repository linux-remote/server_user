const fs = require('fs');
const path = require('path');
const sas = require('sas');

const readdir = require('./readdir.js');
const {checkCoverByLstat} = require('../../lib/fs-check-cover');
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
    fs.writeFile(data.filePath, data.content || '', {flag}, callback);
  },
  mkdir(data, callback){
    fs.mkdir(data.filePath, callback);
  },
  sameCwdRename({cwd, filename, newName}, callback){
    const destPath = path.join(cwd, newName);
    checkCoverByLstat(destPath, (err) => {
      if(err){
        return callback(err);
      }
      const srcPath = path.join(cwd, filename);
      fs.rename(srcPath, destPath, callback);
    });
  },

  fsCheckCover({cwd, filenames}, callback){
    fs.readdir(cwd, function(err, files){
      if(err){
        return callback(err);
      }
      const map = Object.create(null);
      filenames.forEach(name => {
        map[name] = true;
      })
      const covered = [];
      files.forEach(filename => {
        if(map[filename]){
          covered.push(filename)
        }
      });
      callback(null, covered);
    })
  }
  // getRecycleBin(data, callback){
  //   ls({
  //     cwd: global.RECYCLE_BIN_PATH
  //   }, callback);
  // }
}