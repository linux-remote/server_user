var express = require('express');
var router = express.Router();
var multer = require('multer');
// var tmpDir = require('os').tmpdir();
var path = require('path');
const ls = require('./ls');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, req.PATH);
  },
  filename: function (req, file, cb) {
    req._originalname = file.originalname;
    // var tmpName = 'lr-upload-tmp' +  prevTmpName + Date.now();
    req._destination_path = path.join(req.PATH, req._originalname);
    cb(null, file.originalname);
  }
})

var upload = multer({storage}).single('file');

router.put('*',  function(req, res, next) {
  
  req.PATH = decodeURIComponent(req.path);

  // req.on('aborted', () => {
  //   fs.unlink(req._destination_path);
  // })
  
  upload(req, res, function(err){
    if(err){
      return next(err);
    }
    // const warpedItemPath = wrapPath(req._originalname);
    req._cmd_ls_opts = {
      self: req._originalname,
      // _isSelfWrap: true
    }
    ls(req, res, next);

    // execComplete(`mv -- ${req._destination_path} ${warpedItemPath}`,  function(err){
    //   if(err){
    //     return next(err);
    //   }

    // }, req.PATH);
  })

});

module.exports = router;