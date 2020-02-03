const os = require('os');
// Protect my disk
global.__TMP_DIR__ = (process.env.NODE_ENV === 'production') ? os.tmpdir() : '/dev/shm';

require('./src/net-server.js');
