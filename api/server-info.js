const express = require('express');
const router = express.Router();
const os = require('os');
const fs = require('fs');
router.get('/', function(req, res, next){
  fs.readFile('/etc/issue', 'utf-8', (err, result) => {
    if(err) return next(err);
    res.json({
      platform: os.platform(),
      hostname: os.hostname(),
      cpus: os.cpus(),
      arch: os.arch(),
      release: os.release(),
      issue: result.trim(),
      totalmem: os.totalmem(),
      tmpdir: os.tmpdir(),
      endianness: os.endianness(),
      networkInterfaces: os.networkInterfaces()
    })
  })

});

module.exports = router;
