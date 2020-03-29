const fs = require('fs');
const path = require('path');
const sas = require('sas');
const { execComplete } = require('../api/child-exec.js');
const { ensureUniqueId } = require('../lib/util.js');
const { checkCoverByLstat } = require('../lib/fs-check-cover.js');
const {wrapPath} = require('../api/util');

const PATH = global.RECYCLE_BIN_PATH;
const generateRecycleId = ensureUniqueId(PATH);

function mvToRecycleBin(data, callback){
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
    callback(null, ids);
  });
}

function emptyRecycleBin(data, callback){
  execComplete(`rm -rf -- ./*`, callback, PATH);
}

function recycleBinDel(data, callback){ // 永久删除

  const filenames = data.filenames.map(filename => {
    return wrapPath(filename);
  });
  execComplete(`rm -rf -- ${filenames.join(' ')}`, callback, PATH);
}

function recycleBinResotre(data, callback){
  
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
      callback(null);
    });

  })
}
module.exports = {
  mvToRecycleBin,
  emptyRecycleBin,
  recycleBinDel,
  recycleBinResotre
}
