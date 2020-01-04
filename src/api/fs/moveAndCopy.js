
const {execComplete} = require('../child-exec');
const { wrapPath } = require('../util');
const path = require('path');
const {checkCoverByLstat, checkCoverByReaddir} = require('../../lib/fs-check-cover');
// -- options:
// https://www.linuxquestions.org/questions/linux-software-2/problem-with-mv-and-cp-771043/
exports.cutAndCopy = function _cutAndCopy(req, res, next){
  const data = req.body;
  
  if(data.isCopyOneOnSameDir) {
    checkCoverByLstat(path.join(req.PATH, data.destFile), function(err){
      if(err) {
        return next(err);
      }
      // -- 不覆盖
      const cmd = `cp -a -- ${wrapPath(data.srcFile)} ${wrapPath(data.destFile)}`;
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
          cmd = `cp -a -- ${fullFiles.join(' ')} ./`;
          break;
        case 'cut': 
          cmd = `mv -- ${fullFiles.join(' ')} ./`;
          break;
        default:
          return res.status(500).send('lr-user-server: unsupport type: ' + data.type);
      }
      execComplete(cmd, function(err){
        if(err){
          return next(err);
        }
        res.send('ok');
      }, req.PATH);

    });
  }

}