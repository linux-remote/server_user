const fs = require('fs');
const path = require('path');
const sas = require('sas');
const { execComplete } = require('../lib/child-exec.js');
const { wrapPath, ensureUniqueId } = require('../lib/util.js');
const { checkCoverByLstat } = require('../lib/fs-check-cover.js');

const PATH = global.RECYCLE_BIN_PATH;
const generateRecycleId = ensureUniqueId(PATH);
let MAX_LEN = 400;
let lenCache = 0;
function getRecycleBinLen(data, callback){
  if(lenCache){
    callback(null, lenCache);
    return;
  }
  getDirLen(PATH, function(err, len){
    if(err){
      return callback(err);
    }
    lenCache = len;
    callback(null, lenCache);
  })
}

function mvToRecycleBin(data, callback){
  if(lenCache > MAX_LEN){
    callback({
      name: 'Error',
      message: 'The Recycle Bin is Full.'
    })
    return;
  }
  const cwd = data.cwd;
  if(cwd === PATH){
    callback(new Error('Wrong place'));
    return;
  }

  const files = data.files;
  
  const tasks = Object.create(null);
  const ids = [];
  files.forEach((filename, i) => {
    // const wrapedPath = wrapPath(filename);

    let destPath;
    const genDustPath = cb => {
      generateRecycleId(function(err, uniqueId){
        if(err){
          return cb(err);
        }
        ids.push(uniqueId);
        destPath = path.join(PATH, uniqueId);
        cb();
      });
    }
    // EXDEV: cross-device link not permitted, 
    const srcPath = path.join(cwd, filename);
    const link = cb => fs.symlink(srcPath, destPath + '.lnk', cb);
    const move = cb => fs.rename(srcPath, destPath, cb);
    // const linkAndMove = cb => execComplete(`(ln -s -- ${wrapedPath} ${destPath}.lnk) && (mv -- ${wrapedPath} ${destPath})`, cb, cwd);
    tasks[i] = [genDustPath, link, move];
  });
  sas(tasks, function(err){
    if(err){
      return callback(err);
    }
    lenCache = lenCache + (ids.length * 2);
    callback(null, {
      ids,
      len: lenCache
    });
  });
}

function emptyRecycleBin(data, callback){
  execComplete(`rm -rf -- ./*`, function(err){
    if(err){
      return callback(err);
    }
    lenCache = 0;
    callback(null, lenCache);
  }, PATH);
}

function recycleBinDel(data, callback){ // 永久删除

  const filenames = data.filenames.map(filename => {
    return wrapPath(filename);
  });
  execComplete(`rm -rf -- ${filenames.join(' ')}`, function(err){
    if(err){
      return callback(err);
    }
    lenCache = lenCache - filenames.length;
    callback(null, lenCache);
  }, PATH);
}

function recycleBinResotre(data, callback){
  if(lenCache > MAX_LEN){
    callback({
      name: 'Error',
      message: 'The Recycle Bin is Full.'
    })
    return;
  }
  const sourcePath = path.resolve(PATH, data.sourcePath);
  checkCoverByLstat(sourcePath, function(err){
    if(err){
      return callback(err);
    }
    const id = data.id;
    const filePath = path.join(PATH, id);
    const lnkPath = path.join(PATH, id + '.lnk');
    const rename = cb => fs.rename(filePath, sourcePath, cb);
    const delLnk = cb => fs.unlink(lnkPath, cb);
    sas([rename, delLnk], function(err){
      if(err){
        return callback(err);
      }
      lenCache = lenCache - 2;
      callback(null, lenCache);
    });

  })
}
module.exports = {
  getRecycleBinLen,
  mvToRecycleBin,
  emptyRecycleBin,
  recycleBinDel,
  recycleBinResotre
}

function getDirLen(dir, callback){
  let len = 0;
  fs.opendir(dir, function(err, dir){
    if(err){
      callback(err);
      return;
    }
    function close(){
      dir.close(function(err) {
        if(err){
          callback(err);
          return;
        }
        callback(null, len);
      });
    }
    function loop(){
  
      dir.read(function(err, dirent){
        if(err){
          callback(err);
          return;
        }
        if(!dirent){
          close();
          return;
        }
        len = len + 1;
        loop();
      });
    }
    loop();
  });
}