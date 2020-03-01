const os = require('os');
const path = require('path');
const userInfo = os.userInfo();

const CONF = global.CONF = Object.create(null);
CONF.sidHash = process.env.LR_SID_HASH;
CONF.hiddenRootDir = path.join(userInfo.homedir, '.linux-remote');

global.__USER_INFO__ = userInfo;
// Protect my disk
global.__TMP_DIR__ = (process.env.NODE_ENV === 'production') ? os.tmpdir() : '/dev/shm';

require('./src/net-server.js');
