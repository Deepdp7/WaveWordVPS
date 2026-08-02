const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function testToggle() {
  try {
    await ssh.connect({
      host: '192.168.0.158',
      username: 'deepdp',
      password: '1414'
    });
    
    console.log('Testing fs operations...');
    const result = await ssh.execCommand(`node -e "
      const fs = require('fs');
      const path = require('path');
      const util = require('util');
      const execPromise = util.promisify(require('child_process').exec);
      
      async function run() {
        try {
          const cloudflaredDir = '/home/deepdp/.cloudflared';
          const files = fs.readdirSync(cloudflaredDir);
          const configFile = files.find(f => f.endsWith('.yml') || f.endsWith('.yaml'));
          console.log('Config file:', configFile);
          
          if (!configFile) throw new Error('No config file');
          
          const configPath = path.join(cloudflaredDir, configFile);
          // Try reading it
          fs.readFileSync(configPath, 'utf-8');
          console.log('Read success');
          
          // Try restarting cloudflared
          await execPromise('pm2 restart cloudflared');
          console.log('Restart success');
        } catch (e) {
          console.log('ERROR:', e.message);
        }
      }
      run();
    "`);
    
    console.log(result.stdout);
    if (result.stderr) console.log('STDERR:', result.stderr);

    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
testToggle();
