const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function testCurl() {
  try {
    await ssh.connect({
      host: '192.168.0.158',
      username: 'deepdp',
      password: '1414'
    });
    
    // Test the backend locally
    const result = await ssh.execCommand('curl -X POST -H "Content-Type: application/json" -d \'{"hostname":"waveword.in","isActive":false}\' http://localhost:5001/api/admin/domains/toggle -i');
    console.log(result.stdout);
    
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
testCurl();
