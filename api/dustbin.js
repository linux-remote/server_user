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
