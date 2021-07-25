var db2 = require("node-localdb");
var services2 = db("/db/services.json");
var mqtt = require('mqtt')
const clientId = os.hostname()

const host = 'ws://129.213.48.167:8083/mqtt'

let serviceChannelLookup = services2.find({})
async function fLookup(){
  var s = await serviceChannelLookup
  return s
}

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

client.on('connect', async () => {
    console.log('Client connected:' + clientId)
    // Subscribe
    client.subscribe('agent', { qos: 0 })
    client.subscribe('execute', { qos: 0 })
    client.subscribe('restart', { qos: 0 })
    s = await fLookup()
    
 s[0].services.forEach(function(service){
    client.subscribe(service, { qos: 0 })
})
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
    if (topic === 'restart') {
        let msg = JSON.parse(message.toString())
        restartService(msg.service)
        }
  })