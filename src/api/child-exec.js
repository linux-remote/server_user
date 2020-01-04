const exec = require('child_process').exec;

exports.execStream = function(cmd, res, cwd){
  let opts = {env : process.env};
  if(cwd){
    opts.cwd = cwd;
  }
  const l = exec(cmd, opts);
  l.stdout.pipe(res);
}

exports.execComplete = function(cmd, callback, cwd) {
  exec(cmd, {env : process.env, cwd}, function(err, stdout, stderr){
    if(err){
      return callback(err);
    }
    if(stderr)  {
      callback({
        name: `childExecError`,
        message: stderr
      });
    } else {
      callback(null, stdout);
    }
  });
}