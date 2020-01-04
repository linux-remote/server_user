var express = require('express');
var router = express.Router();
var fs = require('fs');
const ls = require('./ls');
const path = require('path');
// wx
// w cover  = true
router.put('*',  function(req, res, next) {
  req.on('aborted', () => { 
    //  _console.log('user server aborted');
    stream.destroy();
  });
  req.PATH = decodeURIComponent(req.path);
  const stream = fs.createWriteStream(req.PATH);
  req.pipe(stream);
  stream.once('error', function(err){
    stream.destroy();
    next(err);
  })
  stream.on('finish', function(){

    req._cmd_ls_opts = {
      self: path.basename(req.PATH),
      cwd: path.dirname(req.PATH)
    };
    ls(req, res, next);
  })
});
 
module.exports = router;