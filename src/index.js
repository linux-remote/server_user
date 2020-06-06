const os = require('os');
const path = require('path');
const userInfo = os.userInfo();

const CONF = global.CONF = Object.create(null);
CONF.sidHash = process.env.LR_SID_HASH;
CONF.hiddenRootDir = path.join(userInfo.homedir, '.linux-remote');
global.IS_PRO = process.env.NODE_ENV === 'production';
global.__USER_INFO__ = userInfo;

CONF.arrSrExitKey = 0;

global._AFR_TIMEOUT__ =  global.IS_PRO ? 1000 * 60 * 15 : 1000 * 60 * 15 * 100;
// console.log('global._AFR_TIMEOUT__', global._AFR_TIMEOUT__)
global.RECYCLE_BIN_PATH = path.join(CONF.hiddenRootDir, 'recycle-bin');
global._MAIN_PORT__ = os.tmpdir() + '/linux-remote-server_main.sock';

require('./net-client.js');