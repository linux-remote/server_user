const fs = require('fs');
const path = require('path');

// echo "`whomai` $HOME" -> dw /home/dw
// echo '`whomai` $HOME' -> `whomai` $HOME
// echo '`whomai` \\n'
function escapePath(str){
  str = str.replace(/\\/g, '\\\\');
  return str.replace(/'/g, function(mstr){
    return '\\' + mstr;
  });
}
// exports.escapePath = escapePath;

exports.wrapPath = function(str){
  if(str.length === 0){
    return str;
  }
  str = escapePath(str);
  return `'${str}'`;
}

exports.fsGetOrInit = function (filePath, data, callback){
  fs.readFile(filePath, 'utf-8', function(err, result){
    if(err){
      if(err.code === "ENOENT"){
        fs.writeFile(filePath, data, function(err){
          if(err){
            return callback(err);
          }
          callback(null, data);
        });
      }else{
        callback(err);
      }
    }else{
      callback(null, result);
    }
  })
}

const sortTimeStartPoint = 1585391460206; // 2020/03/28
let autoIId = 0;
exports.ensureUniqueId = function(filePath){
  return function generateId(callback) {
    var id = Date.now() - sortTimeStartPoint;
    id = id.toString();
    id = id + '-' + autoIId;
    autoIId = autoIId + 1;
    fs.lstat(path.join(filePath, id), function(err){
      if(err){
        if(err.code === 'ENOENT'){
          callback(null, id);
        } else {
          callback(err);
        }
      } else {
        generateId(callback);
      }
    });
  }
}

// $$common$$ 
// server user-server 各有一份相同的。
// 2020/01/04
function genUserServerFlag(){
  let wrap = '***';
  let serverName = 'LR-USER-SERVER';
  let START_FLAG = `${wrap}${serverName}-START${wrap}`;
  let ERR_FLAG_START = `${wrap}${serverName}-ERR-START${wrap}`;
  let ERR_FLAG_END = `${wrap}${serverName}-ERR-END${wrap}`;
  return {
    START_FLAG,
    ERR_FLAG_START,
    ERR_FLAG_END
  }
}

exports.genUserServerFlag = genUserServerFlag;
