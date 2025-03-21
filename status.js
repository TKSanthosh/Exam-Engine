const express = require('express');
const { exec,spawn  } = require('child_process');
const app = express();
const wifi = require('node-wifi');
const cors = require('cors');
const port = 5001; // Use a commonly used port if 6000 is problematic
const sudo = require('sudo-prompt');
const options = {
  name: 'MySQL Service Manager',
};

// Initialize wifi module
wifi.init({
    iface: null // network interface, leave it null for the default interface
  });

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));



app.post('/api/restart/:service', (req, res) => {
    const service = req.params.service;
    let command;
    console.log('Service:', service);

    switch (service) {
        case 'exam':
            command = `powershell.exe -Command "Restart-Service -Name 'ExamServiceName'"`;
            break;
        case 'react':
            command = 'pm2 restart react-app';
            break;
        case 'node':
            command = 'pm2 restart server.js'; 
            break;
        case 'mysql':
            command = `powershell.exe -Command "Restart-Service -Name \'MySQL\'"`;
//             command = `
// $secpasswd = ConvertTo-SecureString "${password}" -AsPlainText -Force;
// $mycreds = New-Object System.Management.Automation.PSCredential ("${username}", $secpasswd);
// Stop-Service -Name 'MySQL' -Credential $mycreds;
// `;
            break;
        case 'memcache':
            // command = `powershell.exe -Command "Restart-Service -Name 'Memcached'"`;
            command = `"C:\\pro\\itest\\memcache\\bin\\memcached.exe" -d start`;
            break;
        default:
            return res.status(400).send('Invalid service');
    }

    console.log('Executing command:', command);

    if(service=='mysql'){
      sudo.exec(command,options, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error restarting ${service}:`, error);
            console.error(`stderr:`, stderr);
            return res.status(500).send(`Failed to restart ${service}`);
        }
        console.log(`stdout for ${service}:`, stdout);
        res.send(`Restart command sent for ${service}`);
    });
    }else{
      exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error restarting ${service}:`, error);
            console.error(`stderr:`, stderr);
            return res.status(500).send(`Failed to restart ${service}`);
        }
        console.log(`stdout for ${service}:`, stdout);
        res.send(`Restart command sent for ${service}`);
    });
    }

    
});


////////////////////////////////////////////


// API to fetch available networks

app.get('/api/networks', (req, res) => {
    // Command to scan for available networks
    const command = 'netsh wlan show networks mode=bssid';
  
    // Suppress terminal window on Windows
    const options = {
      windowsHide: true
    };
  
    exec(command, options, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return res.status(500).json({ error: 'Failed to fetch networks' });
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
        return res.status(500).json({ error: stderr });
      }
  
      // Parse the command output to get available networks
      const networks = parseNetworkList(stdout);
    //   console.log('networks',networks);
      // Respond with the list of networks
      res.json(networks);
    });
  });
  
  
  // API to connect to a network
app.post('/api/connect', async (req, res) => {
    const { ssid, password } = req.body;
  
    if (!ssid || !password) {
      return res.status(400).json({ error: 'SSID and password are required' });
    }
  
    try {
      await wifi.connect({ ssid, password });
      res.json({ message: 'Connected successfully!' });
    } catch (error) {
      console.error('Error connecting to the network:', error);
      res.status(500).json({ error: 'Failed to connect to the network' });
    }
  });

 
// API to get connection status
app.get('/api/connection-status', (req, res) => {
  // Command to get Wi-Fi connection status
  const command = 'netsh wlan show interfaces';

  // Options to suppress terminal window on Windows
  const options = {
    windowsHide: true
  };

  exec(command, options, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return res.status(500).json({ error: 'Failed to fetch connection status' });
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
      return res.status(500).json({ error: stderr });
    }

    // Parse stdout to determine connection status
    const isConnected = stdout.includes('State                  : connected');
    const connectionDetails = parseConnectionDetails(stdout); // Custom function to parse details
 
    res.json({
      connected: isConnected,
      details: connectionDetails // Send parsed details
    });
  });
});




app.post('/api/disconnect', async (req, res) => {
  try {
    await disconnectWiFi();
    res.json({ message: 'Disconnected successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to disconnect' });
  }
});

function disconnectWiFi() {
    return new Promise((resolve, reject) => {
      // Run the Windows 'netsh' command to disconnect from Wi-Fi
      exec('netsh wlan disconnect', { windowsHide: true }, (error, stdout, stderr) => {
        if (error) {
          reject(`Error disconnecting: ${stderr}`);
        } else {
          resolve(stdout);
        }
      });
    });
  }

function parseConnectionDetails(output) {
const details = {};

// Split the output into lines
const lines = output.split('\n');

// Iterate over each line to extract details
lines.forEach(line => {
    // Trim any leading or trailing whitespace
    const trimmedLine = line.trim();
    
    // Extract information based on the label
    if (trimmedLine.startsWith('SSID')) {
    details.ssid = trimmedLine.split(':')[1].trim();
    } else if (trimmedLine.startsWith('BSSID')) {
    details.bssid = trimmedLine.split(':')[1].trim();
    } else if (trimmedLine.startsWith('Signal')) {
    details.signal = trimmedLine.split(':')[1].trim();
    } else if (trimmedLine.startsWith('State')) {
    details.state = trimmedLine.split(':')[1].trim();
    }
});

return details;
}

// Function to parse network details from the output
function parseNetworkList(output) {
const networks = [];
// console.log('output',output);

const lines = output.split('\n');
let currentNetwork = null;

lines.forEach(line => {
    line = line.trim();

    if (line.startsWith('SSID')) {
    if (currentNetwork) {
        networks.push(currentNetwork);
    }
    currentNetwork = { ssid: line.split(':')[1].trim() };
    } else if (line.startsWith('Signal')) {
    if (currentNetwork) {
        currentNetwork.signal = line.split(':')[1].trim();
    }
    }
});

if (currentNetwork) {
    networks.push(currentNetwork);
}

return networks;
}

  
app.listen(port, () => {
    console.log(`Node.js servers running on port ${port}`);
});
