const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function testLogic() {
  try {
    await ssh.connect({
      host: '192.168.0.158',
      username: 'deepdp',
      password: '1414'
    });
    
    console.log('Testing logic...');
    const result = await ssh.execCommand(`node -e "
      const fs = require('fs');
      
      async function run() {
        const configContent = fs.readFileSync('/home/deepdp/.cloudflared/config.yml', 'utf-8');
        console.log('Config file:', configContent);
        
        const lines = configContent.split('\\n');
        let currentHostname = '';
        let modified = false;
        
        const targetHostname = 'waveword.in'; // Test domain
        const isActive = false; // Turn OFF
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const hostMatch = line.match(/-\\s*hostname:\\s*([^\\s]+)/);
          if (hostMatch) {
            currentHostname = hostMatch[1];
          }

          if (line.match(/\\s*service:/) && currentHostname === targetHostname) {
            console.log('Found service line:', line);
            if (isActive === false) {
              const serviceMatch = line.match(/\\s*service:\\s*([^\\s#]+)/);
              if (serviceMatch && serviceMatch[1] !== 'http_status:404') {
                const originalService = serviceMatch[1];
                lines[i] = line.replace(
                  /service:\\s*([^\\s#]+)/,
                  \\\`service: http_status:404 # ORIGINAL_SERVICE: \\\${originalService}\\\`
                );
                modified = true;
                console.log('Replaced to:', lines[i]);
              }
            }
            break;
          }
        }
        console.log('Modified:', modified);
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
testLogic();
