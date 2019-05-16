// const os = require('os');
const {exec} = require('child_process');
const fs = require('fs');
const sas = require('sas');
const path = require('path');
const {wrapPath} = require('./util');
const { ensureUniqueId, preventUnxhr } = require('../lib/util');
const {_reGetItem} = require('./common');
const ls = require('./ls');

const bodyMap = {
  createSymbolicLink,
  rename,
  createFile,
  createFolder,
  checkCover
}

function fsSys(req, res, next){
  const method = req.method;
  req.PATH = decodeURIComponent(req.path);
  if(method === 'GET'){

    // if(preventUnxhr(req, res)){
    //   return;
    // }

    if(req.query.dir){
      if(preventUnxhr(req, res)){
        return;
      }
      return readDir(req, res, next);
    }else{
      //console.log('req.path', req.PATH, path.basename(req.PATH))
      if(req.query.download){
        res.set({
          'Content-Disposition': 'attachment; filename="' + path.basename(req.PATH) + '"'
        })
      }
      next();
      return;
    }
  }

  if(preventUnxhr(req, res)){
    return;
  }

  if(method === 'DELETE'){
    return moveToDustbin(req, res, next);
  }

  if(method === 'PUT'){
    return updateFile(req, res, next);
  }

  if(method === 'POST'){
    const ctrl = bodyMap[req.body.type || req.query.type];
    if(ctrl){
      return ctrl(req, res, next);
    }
  }

  next();
}

function checkCover(req, res, next){
  fs.readdir(req.PATH, function(err, files){
    if(err){
      return next(err);
    }
    const map = Object.create(null)
    const fileList = req.body.fileList;
    fileList.forEach(name => {
      map[name] = true;
    })
    const covered = [];
    files.forEach(filename => {
      if(map[filename]){
        covered.push(filename)
      }
    });
    res.json(covered);
  })
}

function createSymbolicLink(req, res, next){
  const {name} = req.body;
  let _newPath = path.dirname(req.PATH);
  _newPath = path.join(_newPath, name);
  exec('ln -s ' + wrapPath(req.PATH) + ' ' + wrapPath(_newPath), (err) => {
    if(err) return next(err);

    req._itemPath = _newPath;
    _reGetItem(req, res, next);
  })
}

function rename(req, res, next){
  const {oldName, newName} = req.body;
  const oldPath = path.join(req.PATH, oldName);
  const newPath = path.join(req.PATH, newName);
  fs.rename(oldPath, newPath, function(err){
    if(err) return next(err);
    res.end('ok');
  })
}

const generateRecycleId = ensureUniqueId(global.RECYCLE_BIN_PATH);
function moveToDustbin(req, res, next){
  const _path = req.PATH;

  if(path.dirname(_path) === global.RECYCLE_BIN_PATH){
    return deleteAll(req, res, next);
  }

  const dustPath = global.RECYCLE_BIN_PATH + '/' + generateRecycleId();
  const wrapedPath = wrapPath(_path);
  //const checkUnique = cb => fs.stat()
  const link = cb => exec(`ln -s ${wrapedPath} ${dustPath}.lnk`, cb);
  const move = cb => exec(`mv ${wrapedPath} ${dustPath}`, cb);
  sas([move, link], function(err){
    if(err) return next(err);
    res.end('ok');
  })
}

function deleteAll(req, res, next){
  exec('rm -rf ' + wrapPath(req.PATH), function(err){
    if(err) return next(err);
    res.end('ok');
  })
}

function createFolder(req, res, next){
  const _path = path.join(req.PATH, req.body.name);
  fs.mkdir(_path, err => {
    if(err){
      return next(err);
    }

    req._itemPath = _path;
    _reGetItem(req, res, next);
    
  })
}

function updateFile(req, res, next){
  //const _path = path.join(req.PATH, req.body.name);
  fs.writeFile(req.PATH, req.body.text, err => {
    if(err){
      return next(err);
    }

    req._itemPath = req.PATH;
    _reGetItem(req, res, next);
  });
}

function createFile(req, res, next){
  const _path = path.join(req.PATH, req.body.name);
  fs.writeFile(_path, '', err => {
    if(err){
      return next(err);
    }

    req._itemPath = _path;
    _reGetItem(req, res, next);
  });
}


function readDir(req, res, next){
  ls(req.PATH, (err, result) => {
    if(err) return next(err);
    res.json(result);
  })
}

module.exports = fsSys;
