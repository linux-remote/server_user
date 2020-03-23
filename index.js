const os = require('os');
const path = require('path');
const userInfo = os.userInfo();

const CONF = global.CONF = Object.create(null);
CONF.sidHash = process.env.LR_SID_HASH;
CONF.hiddenRootDir = path.join(userInfo.homedir, '.linux-remote');
global.IS_PRO = process.env.NODE_ENV === 'production';
global.__USER_INFO__ = userInfo;
global._AFR_TIMEOUT__ =  global.IS_PRO ? 1000 * 60 * 15 : Infinity;
global.RECYCLE_BIN_PATH = path.join(CONF.hiddenRootDir, 'recycle-bin');
// Protect my disk
global.__TMP_DIR__ = global.IS_PRO ? os.tmpdir() : '/dev/shm';

require('./src/net-server.js');
