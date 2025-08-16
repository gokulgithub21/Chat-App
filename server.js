const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:4200", // Angular app URL
    methods: ["GET", "POST"]
  }
});

let onlineUsers = {}; 
let lastSeenData = {};


app.get("/", (req, res) => {
  res.send("Server is running...");
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('userOnline', (email) => {
    onlineUsers[email] = socket.id;
    delete lastSeenData[email]; // Clear last seen since the user is online
    console.log(`${email} is now online.`);

    // Notify all clients of the updated online users list
    io.emit('updateOnlineUsers', getOnlineUsers());
  });

  // ✅ Listen for New Messages
  socket.on('sendMessage', (message) => {
    console.log('Message received:', message);
    
    // Broadcast message to other users
    io.emit('receiveMessage', message);
  });

  // ✅ Listen for Message Deletion
  socket.on('deleteMessages', (data) => {
    console.log('Deleting messages:', data.messageIds);

    // Broadcast deletion to all clients
    io.emit('deleteMessages', data);
  });

  socket.on('deleteGroupMessages', (data) => {
    console.log('Deleting group messages:', data.messageIds, "For Group ID:", data.groupId);
    io.to(`group_${data.groupId}`).emit('deleteGroupMessages', data); // ✅ Send only to group
  });

  socket.on('disconnect', () => {
    const userEmail = Object.keys(onlineUsers).find(email => onlineUsers[email] === socket.id);
    if (userEmail) {
      delete onlineUsers[userEmail];

      // Update last seen timestamp
      const lastSeen = new Date().toISOString();
      lastSeenData[userEmail] = lastSeen;

      // Notify all clients of the updated online users list
      io.emit('updateOnlineUsers', getOnlineUsers());
    }
  });

  function getOnlineUsers() {
    const users = {};
    Object.keys(onlineUsers).forEach(email => {
      users[email] = { isOnline: true, lastSeen: null };
    });
    Object.keys(lastSeenData).forEach(email => {
      if (!users[email]) {
        users[email] = { isOnline: false, lastSeen: lastSeenData[email] };
      }
    });
    console.log('Current Online Users:', users); // Debug log
    return users;
  }
  

  Object.keys(lastSeenData).forEach(email => {
    io.emit('updateOnlineStatus', { email, isOnline: false, lastSeen: lastSeenData[email] });
  });
  
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
