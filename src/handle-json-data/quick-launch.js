const fs = require('fs');
const path = require('path');

const { getFileOrDef } = require('./util.js');

const qlPath = path.join(global.CONF.hiddenRootDir, 'quick-launch.json');
function getQuickLaunch(data, callback){
  getFileOrDef(qlPath, '', callback);
}

function saveQuickLaunch(content, callback){
  fs.writeFile(qlPath, content, callback);
}
function saveQuickLaunchWidth(width, callback){
  getQuickLaunch(null, function(err, content){
    if(err){
      callback(err);
      return;
    }
    let data;
    if(content){
      data = JSON.parse(content);
      data.width = width;
    } else {
      data = {
        width: width,
        list: []
      }
    }
    saveQuickLaunch(JSON.stringify(data), callback);
  });
}

module.exports = {
  getQuickLaunch,
  saveQuickLaunch,
  saveQuickLaunchWidth
}
