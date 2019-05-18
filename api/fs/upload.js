var express = require('express');
var router = express.Router();
var multer = require('multer');
var tmpDir = require('os').tmpdir();
var path = require('path');
var fs = require('fs');
const {execComplete} = require('../child-exec');
const {wrapPath} = require('../util');
const prevTmpName = path.basename(process.env.PORT, '.sock');
const ls = require('./ls');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tmpDir);
  },
  filename: function (req, file, cb) {
    req._originalname = file.originalname;
    var tmpName = 'lr-upload-tmp' +  prevTmpName + Date.now();
    req.tmpPath = path.join(tmpDir, tmpName);
    cb(null, tmpName);
  }
})

var upload = multer({storage}).single('file');

router.put('*',  function(req, res, next){

  req.on('aborted', () => {
    fs.unlink(req.tmpPath);
  })
  
  upload(req, res, function(err){
    if(err){
      return next(err);
    }
    req.PATH = decodeURIComponent(req.path);
    const warpedItemPath = wrapPath(req._originalname);
    execComplete(`mv ${req.tmpPath} ${warpedItemPath}`,  function(err){
      if(err){
        return next(err);
      }
      req._cmd_ls_opts = {
        self: warpedItemPath,
        _isSelfWrap: true
      }
      ls(req, res);
    }, req.PATH);
  })

});

module.exports = router;