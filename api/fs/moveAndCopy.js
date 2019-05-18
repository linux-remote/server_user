const { exec } = require('child_process');
// const path = require('path');
// const fs = require('fs');

exports.cutAndCopy = function _cutAndCopy(req, res, next){
  const data = req.body;
  console.log('data', data);
  if(data.type === 'copy')  {
    if(data.isCopyOneOnSameDir) {
      // -i 提示
      // -n 不覆盖
      const cmd = `cp -a -n ${data.srcFile} ${data.destFile}`;
      // console.log('cmd', cmd);
      // 未做即时校验, 直接 -n 不覆盖
      exec(cmd, {cwd: req.PATH}, function(err, stdout, stderr){
        if(err){
          return next(err);
        }
        if(stderr){
          return res.status(500).send(stderr);
        }
        res.send('ok');
      });
      return;
    }
  }
  res.status(500).send(`CutAndCopy unhandle.`);
  // let files = req.body.files;
  // const srcDir = req.body.srcDir;
  // const toDir = req.PATH;
  // if(srcDir === toDir) {
  //   res.status(500).send(`srcDir can't same as toDir.`);
  // }
  // files = files.map(name => {
  //   return path.join(srcDir, name);
  // });

  // req
  // exec(`mv `)
}