const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function checkPerms() {
  try {
    await ssh.connect({
      host: '192.168.0.158',
      username: 'deepdp',
      password: '1414'
    });
    
    console.log('Checking permissions...');
    const result = await ssh.execCommand('ls -la /home/deepdp/.cloudflared');
    console.log(result.stdout);
    
    console.log('Testing fs writeFile as node user...');
    const res2 = await ssh.execCommand(`node -e "
      const fs = require('fs');
      try {
        const file = '/home/deepdp/.cloudflared/config.yml';
        const content = fs.readFileSync(file, 'utf8');
        fs.writeFileSync(file, content, 'utf8');
        console.log('Write Success!');
      } catch (e) {
        console.error('Write Error:', e.message);
      }
    "`);
    console.log(res2.stdout);
    if(res2.stderr) console.error(res2.stderr);

    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
checkPerms();
