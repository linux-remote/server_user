var express = require('express');
var router = express.Router();
var fs = require('fs');
// const ls = require('./ls');

// wx
// w cover  = true
router.put('*',  function(req, res, next) {
  req.on('aborted', () => { 
    // console.log('user server aborted');
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
    res.end('ok');
  })
});
 
module.exports = router;