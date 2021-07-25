const express = require('express')
const os = require('os');
const { networkInterfaces } = require('os');
const publicIp = require('public-ip');
const app = express()
app.use(express.json());
const { exec } = require("child_process");
const fs = require('fs')
const axios = require('axios');
var git = require( 'git-rev-sync' );
require('dotenv').config()
eval(fs.readFileSync('functions.js')+'');

var db = require("node-localdb");
var services = db("/db/services.json");

// services.insert({ "services": ["nginx"] })
//   .then(function(u) {
//     console.log(u); // print user, with a auto generate uuid
//   });


app.get('/agent', async function (req, res) {
    let serviceLookup = services.find({})
    let lServices = await serviceLookup
  res.json({
    "brime-agent": {
        "version": require('./package.json').version,
        "git-commit-hash": git.short(),
        "git-commit-url": `https://github.com/brimelive/brime-server-agent/commit/${git.short()}`,
        "uptime": Math.floor(process.uptime())
    },
      "host": {
        "hostname": os.hostname(),
        "external_ip": [await hostPublicIP()],
        "internal_ip": await results[Object.keys(results)[0]][0],
        "network-interfaces": results,
        "host_uptime": hostUptime(),
        "host_uptime_unix": os.uptime()
    },
        "services": {
            "list": lServices[0].services,
            "nginx": {
                config_version: nginxConfigV,
                stats: await nginxUptime()
            }
        }
  
    })
})








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



eval(fs.readFileSync('./websocket.js')+'');
  

  app.listen(3000)