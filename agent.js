const express = require('express')
const os = require('os');
const { networkInterfaces } = require('os');
const publicIp = require('public-ip');
const app = express()
app.use(express.json());
const { exec } = require("child_process");
const fs = require('fs')

fs.readFile('brime-services.json', 'utf8' , (err, data) => {
    if (err) {
      console.error(err)
      return
    }
    console.log(data)
  })

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
            "version": require('./package.json').version,
            uptime: Math.floor(process.uptime())
        },
        "services": {
            "nginx": {
                config_version: "",
                uptime: "",
            }
        }
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


var mqtt = require('mqtt')
const clientId = os.hostname()

const host = 'ws://129.213.48.167:8083/mqtt'

const options = {
  username: clientId,
  keepalive: 60,
  clientId: clientId,
  protocolId: 'MQTT',
  protocolVersion: 4,
  clean: true,
  reconnectPeriod: 1000,
  connectTimeout: 30 * 1000,
  will: {
    topic: 'WillMsg',
    payload: 'Connection Closed abnormally..!',
    qos: 0,
    retain: false
  },
}
console.log('Connecting mqtt client')
const client = mqtt.connect(host, options)

client.on('error', (err) => {
  console.log('Connection error: ', err)
  client.end()
})

client.on('reconnect', () => {
  console.log('Reconnecting...')
})

client.on('connect', () => {
    console.log('Client connected:' + clientId)
    // Subscribe
    client.subscribe('agent', { qos: 0 })
    client.subscribe('execute', { qos: 0 })
  })
function execute(command){
  console.log(command)
  exec(command, (error, stdout, stderr) => {
      if (error) {
          console.log(`error: ${error.message.toString()}`);
          client.publish('logs', error.message.toString(), { qos: 0, retain: false })
      }
      if (stderr) {
        console.log(`stdout: ${stdout.toString()}`);
      }
      console.log(`stdout: ${stdout.toString()}`);
      client.publish('logs', stdout.toString(), { qos: 0, retain: false })
  });
}
  client.on('message', (topic, message, packet) => {
    if (topic === 'execute') {
    let msg = JSON.parse(message.toString())
    console.log(msg.command)
    execute(msg.command)
    }
  })