// const os = require('os');
var express = require('express');
var router = express.Router();

const {execComplete} = require('../child-exec');

router.delete('/kill/:pid', function(req, res, next){
  const pid = req.params.pid;
  if(!/^[0-9]*$/.test(pid)){
    return res.status(500).end(`pid is not number: ${pid}`);
  }
  execComplete(`kill -9 ${pid}`, function(err){
    if(err){
      return next(err);
    }
    res.type('text').end('ok');
  })
});

module.exports = router;
