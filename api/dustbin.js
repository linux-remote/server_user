var express = require('express');
var router = express.Router();
const {exec} = require('child_process');
const sas = require('sas');
const path = require('path');
const ls = require('./fs/ls');
const {wrapPath} = require('./util');

router.get('/', function(req, res){
  req._cmd_ls_opts = {noDir: true};
  req.PATH = global.RECYCLE_BIN_PATH;
  ls(req, res);
})

router.post('/recycle', function(req, res, next){
  const item = req.body;
  const name = item.id;
  const sourceDir = item.sourceDir;
  const filePath = wrapPath(`${sourceDir}/${item.name}`);
  sas({
    mv: cb => exec(`mv ${global.RECYCLE_BIN_PATH}/${name} ${filePath}`, cb),
    delLnk: cb => exec(`rm -rf ${global.RECYCLE_BIN_PATH}/${name}.lnk`, cb)
  }, (err) => {
    if(err) return next(err);
    res.json();
  })
});

router.delete('/:name', function(req, res, next){
  const name = req.params.name;
  sas({
    del: cb => exec(`rm -rf ${global.RECYCLE_BIN_PATH}/${name}`, cb),
    delLnk: cb => exec(`rm -rf ${global.RECYCLE_BIN_PATH}/${name}.lnk`, cb)
  }, (err) => {
    if(err) return next(err);
    res.end('ok');
  })
});

router.delete('/', function(req, res, next){
  exec(`rm -rf ${global.RECYCLE_BIN_PATH}/*`, err => {
    if(err) return next(err);
    res.end('ok');
  });
  // fs.readdir(global.RECYCLE_BIN_PATH, (err, files){
  //   if(err) return next(err);
  //   files.map()
  // })
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