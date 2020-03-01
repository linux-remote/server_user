const fs = require('fs');
const path = require('path');

const { getFileOrDef } = require('./util.js');

const qlPath = path.join(global.CONF.hiddenRootDir, 'quick-launch.json');
function getQuickLaunchItems(data, callback){
  getFileOrDef(qlPath, '', callback);
}

function saveQuickLaunchItems(content, callback){
  fs.write(qlPath, content, callback);
}

module.exports = {
  getQuickLaunchItems,
  saveQuickLaunchItems
}
