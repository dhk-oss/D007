const { spawn } = require('child_process');
const fs = require('fs');
const out = fs.openSync('preview_detached.log', 'a');
const vitePath = process.platform === 'win32' ? 'node_modules\\.bin\\vite.cmd' : 'node_modules/.bin/vite';
const child = spawn(vitePath, ['preview','--host','127.0.0.1','--port','4174','--strictPort'], {
  detached: true,
  stdio: ['ignore', out, out]
});
child.unref();
