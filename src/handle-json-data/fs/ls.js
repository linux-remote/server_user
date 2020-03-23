
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

  let d = '', a = '';
  let filename = '';
  

  if(opts.filename) {
    d = ' -d';
    if(Array.isArray(opts.filename)){
      filename = opts.filename.map(name => {
        return wrapPath(name);
      });
      filename = filename.join(' ');
    } else {
      filename = wrapPath(opts.filename);
    }
  }
  if(opts.all){ //去掉 . 和 ..
    a = ` -A`;
  }
  // if(opts.dir){ // 包含 . 
  //   a = ` -a --ignore='..'`;
  // }
  const cmd = `ls -U -l --color=none -Q --time-style='+%Y-%m-%d %H:%M:%S'${a}${d} -- ${filename}`;
  return cmd;
}

module.exports = ls;
