const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function buildServer() {
  try {
    await ssh.connect({
      host: '192.168.0.158',
      username: 'deepdp',
      password: '1414'
    });
    
    console.log('Building server on VPS...');
    const buildRes = await ssh.execCommand('npm run build', { cwd: '/home/deepdp/WaveWordVPS/server' });
    console.log('Build output:\n', buildRes.stdout);
    if (buildRes.stderr) console.error('Build stderr:\n', buildRes.stderr);
    
    console.log('Restarting PM2...');
    const pm2Res = await ssh.execCommand('pm2 restart waveword-vps-server');
    console.log('PM2 restart:\n', pm2Res.stdout);
    
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
buildServer();
