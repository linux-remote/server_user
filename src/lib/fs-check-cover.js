const fs = require('fs');

exports.checkCoverByLstat = function(filePath, callback){
  fs.lstat(filePath, function(err, stat){
    if(err) {
      if(err.code === 'ENOENT'){
        return callback(null, stat);
      }
      return callback(err);
    }
    return callback({
      name: 'checkCoverError',
      message: filePath + ' Already exist'
    });
  });
}
exports.checkCoverByReaddir = function(dir, files, callback){
  fs.readdir(dir, function(err, allFiles){
    if(err){
      return callback(err);
    }
    const map = Object.create(null);
    let checkLen = files.length;
    files.forEach(filename => {
      map[filename] = true;
    });
    var i = 0, len = allFiles.length, _name, covedArr = [];
    for(; i < len; i++){
      _name = allFiles[i];
      if(map[_name]){
        checkLen = checkLen - 1;
        covedArr.push(_name);
      }
      if(checkLen === 0){
        break;
      }
    }
    if(covedArr.length) {
      return callback({
        name: 'checkCoverError',
        message: covedArr.join(' , ') + ' Already exist'
      });
    }
    callback(null);
  })
}
// module.exports = function(files, callback){
//   const tasks = Object.create(null);
//   files.forEach((filePath, i) => {
//     tasks[i] = function(cb){
//       fs.stat(filePath, function(err){
//         if(err) {
//           if(err.code === 'ENOENT'){
//             return cb(null);
//           }
//           return cb(err);
//         }
//         return cb({
//           name: 'checkCoverError',
//           message: filePath + ' Already exist'
//         });
//       });
//     }
//   });
//   sas(tasks, callback);
// }
