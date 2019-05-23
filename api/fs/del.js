const sas = require('sas');
const {exec} = require('child_process');
const path = require('path');
const {execComplete} = require('../child-exec');
const { ensureUniqueId } = require('../../lib/util');
const {wrapPath} = require('../util');

const generateRecycleId = ensureUniqueId(global.RECYCLE_BIN_PATH);

function mvToRecycleBin(req, res, next){


  const files = req.body.files;
  
  const tasks = Object.create(null);

  files.forEach((filename, i) => {
    const wrapedPath = wrapPath(path.join(req.PATH, filename));
    let dustPath;

    const genDustPath = cb => {
      generateRecycleId(function(err, uniqueId){
        if(err){
          return cb(err);
        }
        dustPath = wrapPath(uniqueId);
        cb();
      });
    }

    const link = cb => execComplete(`ln -s -- ${wrapedPath} ${dustPath}.lnk`, cb,global.RECYCLE_BIN_PATH);
    const move = cb => execComplete(`mv -- ${wrapedPath} ${dustPath}`, cb, global.RECYCLE_BIN_PATH);
    tasks[i] = [genDustPath, move, link];
  });

  sas(tasks, function(err){
    if(err) {
      return next(err);
    }
    res.end('ok');
  })
}


function rm_rf(req, res, next){
  exec('rm -rf ' + wrapPath(req.PATH), function(err){
    if(err) return next(err);
    res.end('ok');
  })
}

module.exports = function(req, res, next){
  if(global.RECYCLE_BIN_PATH === req.PATH) {
    rm_rf(req, res, next);
  } else {
    mvToRecycleBin(req, res, next);
  }
};
