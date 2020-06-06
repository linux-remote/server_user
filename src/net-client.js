const fs = require('fs');
const net = require('net');
const handleJsonData = require('./handle-json-data/index.js');
// const handleNormal = require('./handle-normal.js');

const CONF = global.CONF;
const userInfo = global.__USER_INFO__;
if(!userInfo.homedir){
  console.error('Error: not have homedir');
  return;
}
if(userInfo.homedir === '/'){
  console.error('Error: homedir cannot be ' + userInfo.homedir);
  return;
}

try {
  fs.statSync(CONF.hiddenRootDir);
} catch(err){
  if(err.code === 'ENOENT'){
    try {
      fs.mkdirSync(CONF.hiddenRootDir);
      fs.mkdirSync(global.RECYCLE_BIN_PATH);
    } catch(err) {
      console.error(err.name + ": " + err.message);
      return;
    }
  } else {
    console.error(err.name + ": " + err.message);
    return;
  }
}

function init(){

  function _dataListener(data){
    if(data === 'ok'){
      end(null, client);
    } else {
      end(new Error('403'));
    }
  }
  function _errListener(err){
    end(err);
  }

  let isEnd = false;
  let timer = null;

  const client = net.createConnection(global._MAIN_PORT__, () => {
    client.setEncoding('utf-8');
    client.setNoDelay();
    client.write(process.env.LR_ONCE_TOKEN);
    client.once('data', _dataListener);
  });
  client.once('error', _errListener);
  timer = setTimeout(function(){
    timer = null;
    client.destroy();
    end(new Error('userServerConnectTimeout'));
  }, 5000);
  function end(err){
    if(timer){
      clearTimeout(timer);
    }
    if(isEnd){
      return;
    }
    isEnd = true;

    client.off('data', _dataListener);
    client.off('error', _errListener);
    if(err){
      console.error('\n----------------------- user process create fail -----------------------\n', err)
      return;
    }

    console.log('\n----------------------- user process create success -----------------------\n');
    client.setTimeout(global._AFR_TIMEOUT__);
    client.on('timeout', () => {
      global.__SOCKET_REQUEST__.request([CONF.arrSrExitKey, 'timeout']);
      console.log('socket timeout');
      client.end(() => {
        console.log('\n----------------- process.exit -----------------\n');
        process.exit();
      });
    });
    handleJsonData(client);
    
  }
}

init();
