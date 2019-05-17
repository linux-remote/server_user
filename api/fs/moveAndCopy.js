const { exec } = require('child_process');
const path = require('path');
const sas = require('sas');

exports.cutAndCopy = function _cutAndCopy(req, res, next){
  const data = req.body;
  console.log('data', data);
  if(data.type === 'copy')  {
    if(data.isCopyOneOnSameDir) {
      exec(`cp ${data.srcFile} ${data.destName}`, {cwd: req.PATH}, function(err){
        if(err){
          return next(err);
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