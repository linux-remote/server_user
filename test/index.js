// const child = require('child_process');
// const c = child.spawn(process.argv[0], ['./pt.js']);

// c.stdout.on('data', (data) => {
//   if(data === 'PassSid:'){
//     console.log('================================')
//   }
//   console.log('stdout', data.toString());
// });

// c.stderr.on('data', (data) => {
//   console.error('stderr', data.toString());
// });


const nodePty = require('node-pty');

const pty = nodePty.spawn(process.argv[0], ['./terminal-pass-through.js'], {
  name: 'xterm-color',
  cols: 80,
  rows: 30,
  env: process.env
});


pty.addListener('data', (data) => {
  if(data.indexOf('TERMINAL_PASS_THROUGH_INPUT:') !== -1){
    console.log('================================');
    pty.write('password\n');
  }
  console.log('[stdout]', data.length, data.toString());
});