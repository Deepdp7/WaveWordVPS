const { NodeSSH } = require('node-ssh');
const path = require('path');
const fs = require('fs');

const ssh = new NodeSSH();

async function deployDist() {
  try {
    console.log('Connecting to VPS...');
    await ssh.connect({
      host: '192.168.0.158',
      username: 'deepdp',
      password: '1414'
    });
    console.log('Connected!');

    const clientPath = '/home/deepdp/WaveWordVPS/client';
    const localDistPath = path.join(__dirname, 'client/dist');

    console.log(`Uploading ${localDistPath} to ${clientPath}/dist ...`);
    const status = await ssh.putDirectory(localDistPath, `${clientPath}/dist`, {
      recursive: true,
      concurrency: 10
    });
    
    if (status) {
      console.log('Upload successful!');
    } else {
      console.log('Upload failed!');
    }
    
    // Nginx or whatever serves the dist directory doesn't even need restarting, 
    // but just in case PM2 serves it via the express static or something
    const pm2Result = await ssh.execCommand('pm2 restart all');
    console.log('PM2 restart:', pm2Result.stdout);
    
    console.log('Deployment complete!');
    process.exit(0);
  } catch (err) {
    console.error('Deployment failed:', err);
    process.exit(1);
  }
}

deployDist();
