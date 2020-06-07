
const net = require('net');
const handleJsonData = require('./handle-json-data/index.js');
// const handleNormal = require('./handle-normal.js');

const ppid = process.ppid;
let sid;
let isConnect = false;
let reConnectCount = 0;
const reConnectMax = 5;
const reConnectInterval = 1500;
let reConnectTimer = null;
function init(){

  const client = net.createConnection(global._MAIN_PORT__, () => {
    isConnect = true;
    reConnectCount = 0;
    if(reConnectTimer){
      clearTimeout(reConnectTimer);
    }

    client.setEncoding('utf-8');
    if(sid){
      client.write(sid + ' ' + global.__USER_INFO__.username);
    } else {
      client.write(process.env.LR_ONCE_TOKEN);
    }
    client.once('data', _firstDataListener);
  });

  client.once('error', _beforeErrListener);
  function _beforeErrListener(){
    if(!isConnect){
      reConnect();
    }
  }

  function reConnect(){
    if(isConnect || reConnectCount >= reConnectMax){
      reConnectTimer = null;
      return;
    }
    console.log('reConnectCount', reConnectCount)
    reConnectTimer = setTimeout(function(){
      init();
      reConnectCount = reConnectCount + 1;
      reConnect();
    }, reConnectInterval);
  }

  function _firstDataListener(data){
    let msgs = data.split(' ');
    if(msgs[0] === 'ok'){
      if(!sid){
        if(!msgs[1]){
          throw new Error('un have sid.');
        }
        sid = msgs[1];
      }
      _end(null, client);
    } else {
      _end(new Error('403'));
    }
  }



  let isEnd = false;
  
  
  function _end(err){
    if(isEnd){
      return;
    }
    isEnd = true;

    client.off('error', _beforeErrListener);

    if(err){
      console.error('user process create fail', err)
      return;
    }
    console.log('user process create success');
    client.setTimeout(global._AFR_TIMEOUT__);
    client.on('timeout', () => {
      global.__SOCKET_REQUEST__.request([global.CONF.arrSrExitKey, 'timeout']);
      console.log('socket timeout');
      client.end(() => {
        console.log('\n----------------- process.exit -----------------\n');
        process.exit();
      });
    });
    client.on('error', function(err){
      console.error('handle client error', err);
    })
    handleJsonData(client);
  }


  client.on('close', function(){
    if(process.ppid === ppid){
      // init();
      isConnect = false;
      reConnect();
    }
  })
}

init();

