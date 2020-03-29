
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
  // filenames, cwd, noDir
  const cmd = genCmd(opts);
  const cwd = opts.cwd;
  execComplete(cmd, callback, cwd);
}

function genCmd(opts) {

  let d = '', a = '';
  let filenames = '';
  

  if(opts.filenames) {
    d = ' -d';
    filenames = opts.filenames.map(name => {
      return wrapPath(name);
    });
    filenames = filenames.join(' ');
  }
  if(opts.all){ //去掉 . 和 ..
    a = ` -A`;
  }
  // if(opts.dir){ // 包含 . 
  //   a = ` -a --ignore='..'`;
  // }
  const cmd = `ls -U -l --color=none -Q --time-style='+%Y-%m-%d %H:%M:%S'${a}${d} -- ${filenames}`;
  return cmd;
}

module.exports = ls;
