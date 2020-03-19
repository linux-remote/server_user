
const {execComplete} = require('../../api/child-exec');
const {wrapPath} = require('../../api/util');
// const {execStream} = require('../child-exec');
// function lsStream(req, res){
//   const opts = req._cmd_ls_opts || Object.create(null);
//   const cmd = genCmd(opts);
//   const cwd = opts.cwd || req.PATH;
//   execStream(cmd, res, cwd);
// }

function ls(opts, callback){
  // filename, cwd, noDir
  const cmd = genCmd(opts);
  const cwd = opts.cwd;
  execComplete(cmd, callback, cwd);
}

function genCmd(opts) {

  let d = '', a = ` -a --ignore='..'`;
  let filename = '';
  

  if(opts.filename) {
    d = ' -d';
    filename = wrapPath(opts.filename);
  }

  if(opts.noDir){ //去掉 . 和 ..
    a = ' -A';
  }
  const cmd = `ls -U -l --color=none -Q --time-style='+%Y-%m-%d %H:%M:%S'${a}${d} -- ${filename}`;
  return cmd;
}

module.exports = ls;
