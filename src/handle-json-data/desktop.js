const { getFileOrDef } = require('./util.js');
const fs = require('fs');
const path = require('path');
const confPath = path.join(global.CONF.hiddenRootDir, 'desktop.json');

function getDesktopIcons(data, callback){
  getFileOrDef(confPath, '', callback);
}
function saveDesktopIcons(content, callback){
  if(!content){
    callback(null, '');
    return;
  }
  fs.writeFile(confPath, content, callback);
}

module.exports = {
  getDesktopIcons,
  saveDesktopIcons
}
