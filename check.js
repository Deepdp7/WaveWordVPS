const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function check() {
  try {
    await ssh.connect({
      host: '192.168.0.158',
      username: 'deepdp',
      password: '1414'
    });
    
    // Check how Nginx serves the client or what's running
    const res1 = await ssh.execCommand('cat /etc/nginx/sites-enabled/*');
    console.log('Nginx configs:\n', res1.stdout);

    const res2 = await ssh.execCommand('ls -la /home/deepdp/WaveWordVPS/client/dist');
    console.log('Client dist folder:\n', res2.stdout);

    const res3 = await ssh.execCommand('cat /home/deepdp/WaveWordVPS/client/package.json');
    console.log('Client package.json:\n', res3.stdout);

    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
check();
