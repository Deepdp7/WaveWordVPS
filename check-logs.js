const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function getLogs() {
  try {
    await ssh.connect({
      host: '192.168.0.158',
      username: 'deepdp',
      password: '1414'
    });
    
    console.log('Fetching PM2 logs for waveworld-server...');
    const result = await ssh.execCommand('pm2 logs waveworld-server --lines 30 --nostream');
    console.log('--- Logs ---');
    console.log(result.stdout);
    if (result.stderr) console.log(result.stderr);

    console.log('\nFetching PM2 logs for waveword-vps-server (just in case)...');
    const result2 = await ssh.execCommand('pm2 logs waveword-vps-server --lines 30 --nostream');
    console.log('--- Logs ---');
    console.log(result2.stdout);

    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
getLogs();
