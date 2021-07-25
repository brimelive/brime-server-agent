// Public IP
async function hostPublicIP() {
    return await publicIp.v4()
};

const agent_id = os.hostname();

// Host Uptime
function hostUptime() {
  var ut_sec = os.uptime();
  var ut_min = ut_sec / 60;
  var ut_hour = ut_min / 60;

  ut_sec = Math.floor(ut_sec);
  ut_min = Math.floor(ut_min);
  ut_hour = Math.floor(ut_hour);

  ut_hour = ut_hour % 60;
  ut_min = ut_min % 60;
  ut_sec = ut_sec % 60;
  return `${ut_hour} Hour(s) ${ut_min} Minute(s) ${ut_sec} Second(s)`;
}

// Nginx Data
async function nginxUptime() {
  try {
    const response = await axios.get("http://150.230.37.173/stat");
    let data = response.data["http-flv"];
    let uptime = `${data.uptime.toString()}`;
    let streams = `${data.servers[0].applications[0].live.nclients / 3}` ?? "null";
    let nginxMsg = {}
    nginxMsg.uptime = uptime;
    nginxMsg.ingest_streams = streams;
    return nginxMsg;
  } catch (error) {
    console.error(error);
  }
}

function restartService(service) {
  const allowedServices = ["nginx", "packager", "rsyslog"];
  if (allowedServices.indexOf(service) > -1) {
    // Allowed Service Call
    exec(`service ${service} restart`, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message.toString()}`);
        client.publish("logs", error.message.toString(), {
          qos: 0,
          retain: false,
        });
        return;
      }
      if (stderr) {
        console.log(`stdout: ${stdout.toString()}`);
        return;
      }
      console.log(`stdout: ${stdout.toString()}`);
      let msg = {} `
        {
            "agent_id": "${agent_id}",
            "success": ""
            "timstamp": "${new Date().getTime()}"
        }`;
      client.publish("logs", msg, { qos: 0, retain: false });
    });
  } else {
    // Call to Service not allowed
    let msg = `
        {
            "agent_id": "${agent_id}",
            "error": "Call to service ${service} not allowed"
            "timstamp": "${new Date().getTime()}"
        }`;
    client.publish("logs", msg, { qos: 0, retain: false });
  }
}

var nginxConfigRead = fs.readFileSync('./brime-config-version.json','utf8');
var nginxConfigV = JSON.parse(nginxConfigRead).version
