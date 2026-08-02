const { NodeSSH } = require('node-ssh');
const path = require('path');
const fs = require('fs');

const ssh = new NodeSSH();

async function deploy() {
  try {
    console.log('Connecting to VPS...');
    await ssh.connect({
      host: '192.168.0.158',
      username: 'deepdp',
      password: '1414',
      readyTimeout: 10000,
      keepaliveInterval: 10000
    });
    console.log('Connected!');

    const findResult = await ssh.execCommand('find /home/deepdp -name "admin.routes.ts"');
    console.log('Found backend files at:\n', findResult.stdout);
    
    const paths = findResult.stdout.split('\n').filter(Boolean);
    const targetPath = paths.find(p => p.includes('WaveWordVPS'));
    let serverPath = null;
    let clientPath = null;
    
    if (targetPath) {
       serverPath = path.dirname(path.dirname(path.dirname(targetPath)));
       clientPath = serverPath.replace('/server', '/client');
       console.log('Detected Server Path:', serverPath);
       console.log('Detected Client Path:', clientPath);
    } else {
       console.log('Could not automatically find the project on VPS.');
       process.exit(1);
    }

    const localServerRoutes = path.join(__dirname, 'server/src/routes/admin.routes.ts');
    const localClientDomains = path.join(__dirname, 'client/src/components/admin/Domains.tsx');

    console.log('Uploading server route...');
    await ssh.putFile(localServerRoutes, `${serverPath}/src/routes/admin.routes.ts`);
    
    console.log('Uploading client component...');
    await ssh.putFile(localClientDomains, `${clientPath}/src/components/admin/Domains.tsx`);
    
    console.log('Building server...');
    const serverBuildResult = await ssh.execCommand('npm run build', { cwd: serverPath });
    console.log('Server build:', serverBuildResult.stdout);
    
    console.log('Restarting node server via PM2...');
    const pm2Result = await ssh.execCommand('pm2 restart all');
    console.log('PM2 restart:', pm2Result.stdout);
    
    console.log('Building client... (this might take a minute)');
    const buildResult = await ssh.execCommand('npm run build', { cwd: clientPath });
    console.log('Client build:', buildResult.stdout);
    
    console.log('Deployment complete!');
    process.exit(0);

  } catch (err) {
    console.error('Deployment failed:', err);
    process.exit(1);
  }
}

deploy();
