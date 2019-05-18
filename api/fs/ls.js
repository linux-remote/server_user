
const {execStream} = require('../child-exec');
const {wrapPath} = require('../util');
function lsStream(req, res){
  const cmd = genCmd(req._cmd_ls_opts);

  // console.//log('lsStream cmd', cmd);
  execStream(cmd, res, req.PATH);
}

function genCmd(opts) {
  opts = opts || {};

  let d = '', a = ' -a';
  let self = '';
  

  if(opts.self) {
    d = ' -d';
    self = opts._isSelfWrap ? opts.self : wrapPath(opts.self);
    self = ' ' + self;
  }

  if(opts.noDir){ //去掉 . 和 ..
    a = ' -A';
  }

  const cmd = `ls -f -l --color=none -Q --time-style='+%Y-%m-%d %H:%M:%S'${a}${d}${self}`;
  return cmd;
}

module.exports = lsStream;
