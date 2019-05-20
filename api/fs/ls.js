
const {execStream} = require('../child-exec');
const {wrapPath} = require('../util');
function lsStream(req, res){
  const opts = req._cmd_ls_opts || Object.create(null);
  const cmd = genCmd(opts);
  const cwd = opts.cwd || req.PATH;
  execStream(cmd, res, cwd);
}

function genCmd(opts) {

  let d = '', a = ` -a --ignore='..'`;
  let self = '';
  

  if(opts.self) {
    d = ' -d';
    self = opts._isSelfWrap ? opts.self : wrapPath(opts.self);
    self = ' ' + self;
  }

  if(opts.noDir){ //去掉 . 和 ..
    a = ' -A';
  }
  const cmd = `ls -U -l --color=none -Q --time-style='+%Y-%m-%d %H:%M:%S'${a}${d}${self}`;
  return cmd;
}

module.exports = lsStream;
