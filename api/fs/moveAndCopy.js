
const {execComplete} = require('../child-exec');
const { wrapPath } = require('../util');
const path = require('path');
const {checkCoverByLstat, checkCoverByReaddir} = require('../../lib/fs-check-cover');
// const fs = require('fs');

exports.cutAndCopy = function _cutAndCopy(req, res, next){
  const data = req.body;
  
  if(data.isCopyOneOnSameDir) {
    checkCoverByLstat(path.join(req.PATH, data.destFile), function(err){
      if(err) {
        return next(err);
      }
      // -n 不覆盖
      const cmd = `cp -a -n ${wrapPath(data.srcFile)} ${wrapPath(data.destFile)}`;
      // console.log('cmd', cmd);
      // 未做即时校验, 直接 -n 不覆盖
      execComplete(cmd, function(err){
        if(err){
          return next(err);
        }
        res.send('ok');
      }, req.PATH);
    });

    
  } else {
    const files = data.files;
    checkCoverByReaddir(req.PATH, files, function(checkCoverErr){
      if(checkCoverErr){
        return next(checkCoverErr);
      }

      if(!files.length){
        return res.status(500).send('lr-user-server: files empty.');
      }
      const fullFiles = files.map(v => {
        const fullPath = path.join(data.srcDir, v);
        return wrapPath(fullPath);
      });
      let cmd;
      switch(data.type){
        case 'copy': 
          cmd = `cp -a -n ${fullFiles.join(' ')} ./`;
          break;
        case 'cut': 
          cmd = `mv -n ${fullFiles.join(' ')} ./`;
          break;
        default:
          return res.status(500).send('lr-user-server: unsupport type: ' + data.type);
      }
      // console.log('cmd', cmd);
      // 未做即时校验, 直接 -n 不覆盖
      execComplete(cmd, function(err){
        if(err){
          return next(err);
        }
        res.send('ok');
      }, req.PATH);

    });
  }

}