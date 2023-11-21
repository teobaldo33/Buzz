// Import required modules
const express = require('express');
const http = require('http');
const { Server: SocketIOServer } = require('socket.io');
const path = require('path'); 


// Create an instance of Express
const app = express();
///app.use('/buzz', express.static('./public/buzz-app'));

const allowedExtensions = ['.js'];

app.get('*', (req, res, next) => {
  if (allowedExtensions.some(ext => req.url.includes(ext))) {
    // remove the forward slash at the end of the path 
    const url = req.url.replace(/\/$/,'');
    res.sendFile(path.join(__dirname, 'public', 'buzz-app', url));
  } else {
    res.sendFile(path.join(__dirname, 'public', 'buzz-app', 'index.html'));
  }
});

// Create a server using the Express app
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: "*"
  }
});

// all routes except /admin
// Store admin socket instance
let adminSocket;

// Store connected user names
const connectedUsers = new Map();
let firstBuzzer = null;
let eliminatedTeams = new Set();

  // Handle incoming socket connections
  io.on('connection', (socket) => {
    const userType = socket.handshake.query.userType;
    const userName = socket.handshake.query.userName;

    if (userType === 'admin') {
      adminSocket = socket;
      connectedUsers.forEach((value, key, map) => {
        adminSocket.emit('userConnected', value);
      })
    } else {
      connectedUsers.set(socket, userName);
      if (adminSocket) {
        adminSocket.emit('userConnected', userName);
      }
    }

    // Handle generic user events
    socket.on('buzz', () => {
      if (!firstBuzzer && !eliminatedTeams.has(socket)) {
        firstBuzzer = socket;
        console.log(userName);
        console.log(eliminatedTeams.has(socket));
        if (socket != firstBuzzer) {
          if(adminSocket){
            adminSocket.emit('hasBuzzed', connectedUsers.get(firstBuzzer));
          }
          io.emit('disable');
          firstBuzzer.emit('youBuzzed');
        } else {
          if(adminSocket){
            adminSocket.emit('hasBuzzed', connectedUsers.get(firstBuzzer));
          }
          io.emit('disable');
          firstBuzzer.emit('youBuzzed');
        }
      }
    });

    socket.on('relaunch', () => {
      if (firstBuzzer) {
        console.log(connectedUsers.get(firstBuzzer));
        eliminatedTeams.add(firstBuzzer);
        io.emit('enable');
        if (socket !== firstBuzzer) {
          eliminatedTeams.forEach((team) => {
            team.emit('disable');
          });
        }
        firstBuzzer = null;
      }
    });

    socket.on('reset', () => {
      eliminatedTeams.clear();
      io.emit('enable');
      firstBuzzer = null;
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('A user disconnected');
      connectedUsers.delete(socket);
      if (adminSocket) {
        adminSocket.emit('userDisconnected', userName);
      }
    });
  });

  app.get('*', (req, res, next) => {
    if (allowedExtensions.some(ext => req.url.includes(ext))) {
      // remove the forward slash at the end of the path 
      const url = req.url.replace(/\/$/,'');
      res.sendFile(path.join(__dirname, 'public', 'buzz-app', url));
    } else {
      res.sendFile(path.join(__dirname, 'public', 'buzz-app', 'index.html'));
    }
  });



// Start the server
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
