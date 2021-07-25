const express = require('express')
const os = require('os');
const { networkInterfaces } = require('os');
const publicIp = require('public-ip');
const app = express()

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
        "hostname":'ingest-us-ashburn-001.brime.tv',
        "external_ip": await hostPublicIP(),
        "internal_ip":"",
        "host_uptime": hostUptime(),
        "host_uptime_unix": os.uptime(),
        "network": results
  }
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