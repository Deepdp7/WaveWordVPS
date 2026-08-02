const { NodeSSH } = require('node-ssh'); 
const ssh = new NodeSSH(); 
ssh.connect({host:'192.168.0.158',username:'deepdp',password:'1414'})
  .then(()=>ssh.execCommand('find /home/deepdp -name "admin.routes.ts"'))
  .then(res => { console.log(res.stdout); process.exit(0); });
