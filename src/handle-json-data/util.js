const fs = require('fs');

function getFileOrDef(filePath, defData, callback){
  fs.readFile(filePath, 'utf-8', function(err, result){
    if(err){
      if(err.code === "ENOENT"){
        callback(null, defData);
      }else{
        callback(err);
      }
    }else{
      callback(null, result);
    }
  });
}

module.exports = {
  getFileOrDef
}
