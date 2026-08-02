const { NodeSSH } = require('node-ssh');
const path = require('path');

const ssh = new NodeSSH();

async function deployServer() {
  try {
    console.log('Connecting to VPS...');
    await ssh.connect({
      host: '192.168.0.158',
      username: 'deepdp',
      password: '1414'
    });
    console.log('Connected!');

    const serverPath = '/home/deepdp/WaveWordVPS/server';
    const localServerRoutes = path.join(__dirname, 'server/src/routes/admin.routes.ts');

    console.log('Uploading server route...');
    await ssh.putFile(localServerRoutes, `${serverPath}/src/routes/admin.routes.ts`);
    
    console.log('Restarting PM2 apps...');
    const pm2Result = await ssh.execCommand('pm2 restart all');
    console.log('PM2 restart:\n', pm2Result.stdout);
    
    console.log('Done!');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

deployServer();
