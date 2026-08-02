const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function checkPm2() {
  try {
    await ssh.connect({
      host: '192.168.0.158',
      username: 'deepdp',
      password: '1414'
    });
    
    const result = await ssh.execCommand('pm2 info waveword-vps-server');
    console.log(result.stdout);
    
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
checkPm2();
