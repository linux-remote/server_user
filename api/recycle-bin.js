var express = require('express');
var router = express.Router();
const {execComplete} = require('./child-exec');
const sas = require('sas');
const ls = require('./fs/ls');
const {wrapPath} = require('./util');
const {checkCoverByLstat} = require('../lib/fs-check-cover');

router.get('/', function(req, res, next){

  req.PATH = global.RECYCLE_BIN_PATH;
  req._cmd_ls_opts = {
    noDir: true
  };
  ls(req, res, next);
})

router.post('/restore', function(req, res, next){
  const data = req.body;


  const srcFilePath = data.sourcePath;

  

  checkCoverByLstat(srcFilePath, function(err) {
    if(err){
      return next(err);
    }

    const id = wrapPath(data.id);

    sas({
      mv: cb => execComplete(`mv -n -- ${id} ${wrapPath(srcFilePath)}`, cb, global.RECYCLE_BIN_PATH),
      delLnk: cb => execComplete(`rm -rf -- ${id}.lnk`, cb, global.RECYCLE_BIN_PATH)
    }, (err) => {
      if(err){
        return next(err);
      }
      res.type('text').end('ok');
    });
  });

});

router.delete('/:id', function(req, res, next) {
  const id = wrapPath(req.params.id);
  sas({
    del: cb => execComplete(`rm -rf -- ${id}`, cb, global.RECYCLE_BIN_PATH),
    delLnk: cb => execComplete(`rm -rf -- ${id}.lnk`, cb, global.RECYCLE_BIN_PATH)
  }, (err) => {
    if(err) {
      return next(err);
    }
    res.type('text').end('ok');
  });
});

router.delete('/', function(req, res, next) {
  execComplete(`rm -rf -- ./*`, (err) => {
    if(err) {
      return next(err);
    }

    res.type('text').end('ok');

  }, global.RECYCLE_BIN_PATH);
});

module.exports = router;


// ls(global.RECYCLE_BIN_PATH, 
//   {noDir: true, other: '--reverse'}, 
//     (err, result) => {
//       if(err){
//         return next(err);
//       }
//       const result2 = [];
//       var map = Object.create(null);
//       result.forEach((v) => {
//         let key, isSource, lastIndex = v.name.lastIndexOf('.lnk');
//         if(lastIndex === -1){
//           key = v.name;
//           isSource = true;
//         }else{
//           key = v.name.substr(0, lastIndex);
//           let linkTarget = v.symbolicLink;
//           let pathObj = path.parse(linkTarget.linkPath);
//           v = {
//             delTime: v.mtime,
//             sourceDir: pathObj.dir,
//             name: pathObj.base,
//             isCover: !linkTarget.linkTargetError
//           }
//         }

//         if(!map[key]){
//           map[key] = {
//             id: key
//           };
//           result2.push(map[key]);
//         }
//         if(isSource){
//           delete(v.name);
//           map[key].source = v;
//         }else {
//           Object.assign(map[key], v);
//         }
//         //map[key][subKey] = v;
//       });
//       map = null;
//       res.json(result2);
//     })