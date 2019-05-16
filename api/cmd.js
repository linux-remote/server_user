const exec = require('child_process').exec;

module.exports = function(req, res, next){
  let opts = {env : process.env};
  if(req.body.cwd){
    opts.cwd = req.body.cwd;
  }
  exec(req.body.cmd, opts, function(err, stdout, stderr) {
    if(err) {
      return next(err);
    } else {
      if(stderr){
        res.status(500).send(stderr);
      } else {
        res.send(stdout);
      }
    }
    
  });
}