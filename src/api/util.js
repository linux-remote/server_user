const fs = require('fs');

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

// $$common$$
exports.safeSend = function(ws, msg) {
  if(ws.readyState === 1) {
    ws.send(msg);
  }
}

