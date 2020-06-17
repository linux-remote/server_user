
const net = require('net');
const os = require('os');
const userInfo = os.userInfo();
const handleJsonData = require('./handle-json-data/index.js');

const socketPath = (global.IS_PRO ? os.tmpdir() : '/dev/shm') + '/linux-remote-server_main.sock';
const reConnectMax = 5;
const reConnectInterval = 1000;

let sidCache;
let isConnect = false;
let reConnectCount = 0;
let reConnectTimer = null;

function init(){
  const client = net.createConnection(socketPath, () => {
    isConnect = true;
    reConnectCount = 0;

    if(reConnectTimer){
      clearTimeout(reConnectTimer);
    }

    client.setEncoding('utf-8');
    client.write(sidCache + ' ' + userInfo.username);
    client.once('data', function _firstDataListener(msg){
      if(msg === 'ok'){
        // Avoid sticking
        client.write('ready', function(){
          _end(null, client);
        });
        
      } else {
        _end(new Error(msg));
      }
    });
  });

  


  let isInnerError = false;
  
  function _end(err){
    if(err){
      isInnerError = true;
      console.error('\n[server_user]: user process create fail', err.message);
      if(!client.destroyed){
        client.destroy();
      }
      return;
    }
    console.log('\n[server_user]: user process create success');
    // -------------------- success --------------------


    handleJsonData(client);

    client.setTimeout(global._AFR_TIMEOUT__);
    client.on('timeout', () => {
      global.__SOCKET_REQUEST__.request([global.CONF.arrSrExitKey, 'timeout']);
      console.log('[server_user]: socket timeout');
      client.end(() => {
        console.log('[server_user]: \n----------------- process.exit -----------------\n');
        process.exit();
      });
    });
    // client.on('error', function(err){
    //   console.error('[server_user]: handle client error', err);
    // });
  }


  client.on('close', function(hadError){
    if(!isConnect){
      return;
    }
    if(!isInnerError){
      // when server_main reload.
      console.log('[server_user]: disconnected. reConnecting...');
      isConnect = false;
      reConnect();
    } else {
      console.log('[server_user]: disconnected. isInnerError', isInnerError, 'hadError', hadError);
    }
  });
  
  client.on('error', function(err){
    if(reConnectTimer){
      console.error('[server_user]: reConnect ' + err.name + ': ' + err.message);
    } else {
      console.error('[server_user]: error', err);
    }
  });
}

function reConnect(){
  let isOutMax = reConnectCount >= reConnectMax;
  if(isConnect || isOutMax){
    reConnectTimer = null;
    if(isOutMax){
      console.error('[server_user]: reConnect count out.');
    }
    return;
  }
  reConnectTimer = setTimeout(function(){
    init();
    console.log('[server_user]: reConnect count', reConnectCount);
    reConnectCount = reConnectCount + 1;
    reConnect();
  }, reConnectInterval);
}



function connectServerMain(sid){
  sidCache = sid;
  init();
}

module.exports = connectServerMain;
