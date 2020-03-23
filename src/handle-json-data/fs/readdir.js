const fs = require('fs');
const path = require('path');

function readdir(data, callback){
  let dir, all = true;
  if(typeof data === 'string'){
    dir = data;
  } else {
    dir = data.address;
    all = data.all;
  }
  fs.readdir(dir, {withFileTypes: true}, function(err, files){
    if(err){
      return callback(err);
    }
    let i = 0, len = files.length, dirent;
    const result = [];
    for(; i < len; i++){
      dirent = files[i];
      if(all || dirent.name[0] !== '.'){
        result.push({
          name: dirent.name,
          type: _getType(dirent)
        });
      }
    }
    callback(null, result);
  });
}

// const map = {
//   regularFile: 1,
//   directory: 2,
//   symbolicLink: 3,
//   blockDevice: 4
// }
function _getType(dirent){
  if(dirent.isFile()){
    return 'file';
  }
  if(dirent.isDirectory()){
    return 'directory';
  }
  if(dirent.isSymbolicLink()){
    return 'symbolicLink';
  }
  
  if(dirent.isSocket()){
    return 'socket';
  }
  if(dirent.isBlockDevice()){
    return 'blockDevice';
  }
  if(dirent.isCharacterDevice()){
    return 'characterDevice';
  }

  if(dirent.isFIFO()){
    return 'FIFO';
  }
  return 'unknown';
}
module.exports = readdir;