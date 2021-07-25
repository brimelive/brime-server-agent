const AutoGitUpdate = require('auto-git-update');
const express = require('express')
const os = require('os');
const { networkInterfaces } = require('os');
const publicIp = require('public-ip');
const app = express()

const config = {
    repository: 'https://github.com/brimelive/brime-server-agent',
    tempLocation: '/tmp/',
    ignoreFiles: ['util/config.js', 'node_modules'],
    executeOnComplete: 'npm start agent.js',
    exitOnComplete: true
}
// Host Uptime
function hostUptime(){
    var ut_sec = os.uptime();
    var ut_min = ut_sec/60;
    var ut_hour = ut_min/60;
       
    ut_sec = Math.floor(ut_sec);
    ut_min = Math.floor(ut_min);
    ut_hour = Math.floor(ut_hour);
      
    ut_hour = ut_hour%60;
    ut_min = ut_min%60;
    ut_sec = ut_sec%60;
    return `${ut_hour} Hour(s) ${ut_min} Minute(s) ${ut_sec} Second(s)`
}

// Public IP
async function hostPublicIP() {
    return await publicIp.v4()
};

 
app.get('/agent', async function (req, res) {
  res.json({
      "host": {
        "hostname": os.hostname(),
        "external_ip": await hostPublicIP(),
        "internal_ip":"",
        "host_uptime": hostUptime(),
        "host_uptime_unix": os.uptime(),
        "network": results,
        "agent": {
            "version": require('./package.json').version
        }
  }
    })
})

app.get('/agent/update', function (req, res) {
    const updater = new AutoGitUpdate(config);
    updater.autoUpdate();
    res.json({
    message:"update queued"
    })
})
 
app.listen(3000)

const nets = networkInterfaces();
const results = {};

for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        if (net.family === 'IPv4' && !net.internal) {
            if (!results[name]) {
                results[name] = [];
            }
            results[name].push(net.address);
        }
    }
}
console.log(results);