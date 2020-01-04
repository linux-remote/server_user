const uid = require('uid-safe');
const fs = require('fs');
const path = require('path');

// exports.timeFormat = function(date, fmt){
//   date = date ? new Date(date) : new Date();
//   fmt = fmt || 'yyyy-MM-dd HH:mm:ss';
//   var o = {
//     'M+': date.getMonth() + 1,
//     'd+': date.getDate(),
//     'H+': date.getHours(),
//     'm+': date.getMinutes(),
//     's+': date.getSeconds(),
//     'q+': Math.floor((date.getMonth() + 3) / 3),
//     'S': date.getMilliseconds()
//   };
//   if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
//   for (var k in o)
//     if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
//   return fmt;
// }


/**
 * Event listener for HTTP server "error" event.
 */
// $$common$$
exports.onError = function(port){
  return function(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }

    var bind = typeof port === 'string'
      ? 'Pipe ' + port
      : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
      default:
        throw error;
    }
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
// $$common$$
exports.onListening = function(server, callback) {
  return function(){
    var addr = server.address();
    var bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
    console.info('Listening on ' + bind);
    console.info('NODE_ENV ' + process.env.NODE_ENV);
    callback && callback();
  }
}

exports.ensureUniqueId = function(filePath){
  return function generateId(callback) {
    var id = uid.sync(24);
    fs.lstat(path.join(filePath, id), function(err){
      if(err){
        if(err.code === 'ENOENT'){
          callback(null, id);
        } else {
          callback(err)
        }
      } else {
        generateId(callback);
      }
    });
  }
}
// exports.ensureUniqueIdSync = function(filePath){
//   return function generateId() {
//     var id = uid.sync(24);
//     try{ 
//       fs.statSync(path.join(filePath, id))
//     } catch(e) {
//       if(e.code === 'ENOENT'){
//         return id;
//       }
//       throw e;
//     }
//     return generateId()
//   }
// }
exports.preventUnxhr = function(req, res ){
  if(!req.xhr) {
    res.status(400).end("xhr only");
    return true;
  } else {
    return false;
  }
}

// $$common$$ 
// server user-server 各有一份相同的。
// 2020/04/01
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

// // $$common$$
// '*********** LINUX-REMOTE-USER-SERVER-START ***********';
// // $$common$$
// exports.ERROR_FLAG_START = '*********** LINUX-REMOTE-USER-SERVER-ERROR-START ***********';