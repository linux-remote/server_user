const fs = require('fs');
const MAX = 500;
function openLoopDir({cwd, all}, callback){
  let tbody = [];
  fs.opendir(cwd, function(err, dir){
    if(err){
      callback(err);
      return;
    }
    function close(_err){
      dir.close(function(err) {
        if(err){
          callback(err);
          return;
        }
        if(_err){
          callback(_err);
          return;
        }
        callback(null, tbody);
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
        if(tbody.length > MAX){
          close(new Error('Too many files.'));
        } else {
          if(all || dirent.name[0] !== '.'){
            tbody.push([dirent.name, _getType(dirent)]);
          }
          loop();
        }

      });
    }
    loop();
  });
}


const iconTypeMap = {
  regularFile: 0,
  directory: 1,
  symbolicLink: 2,
  socket: 3,
  blockDevice: 4,
  characterDevice: 5,
  namedPipe: 6,
  unknown: 7
}
function _getType(dirent){
  return iconTypeMap[__getType(dirent)];
}
function __getType(dirent){
  if(dirent.isFile()){
    return 'regularFile';
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
    return 'namedPipe';
  }
  return 'unknown';
}

module.exports = openLoopDir;