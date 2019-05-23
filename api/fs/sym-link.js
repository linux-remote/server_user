const {execComplete} = require('../child-exec');
const ls = require('./ls');
const {wrapPath} = require('../util');
module.exports = function createSymbolicLink(req, res, next){
  const {srcName, newName} = req.body;
  const warpNewName = wrapPath(newName);
  const cmd = `ln -s -- ${wrapPath(srcName)} ${warpNewName}`;
  // console.//log('createSymbolicLink cmd', cmd);
  execComplete(cmd, function(err){
    if(err){
      return next(err);
    }
    req._cmd_ls_opts = {
      self: warpNewName,
      _isSelfWrap : true
    };
    ls(req, res, next);

  }, req.PATH);
}
