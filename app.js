// santass.herokuapp.com
// heroku ps:scale web=1 --app santass

var crypto = require('crypto');
var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

server.listen(process.env.PORT || 3000);

// Sockets object to save game code -> socked associations
var socketCodes = {};

// When a client connects...
io.on('connection', function(socket) 
{
   // Confirm the connection
   socket.emit("welcome", {});
   
   
   // Receive the client device type
   socket.on("device", function(device)
   {
      // if client is a browser game
      if(device.type == "game")
      {
         // Generate a code
         var gameCode = crypto.randomBytes(3).toString('hex');
         
         // Ensure uniqueness
         while(gameCode in socketCodes)
         {
            gameCode = crypto.randomBytes(3).toString('hex');
         }
         
         // Store game code -> socket association
         socketCodes[gameCode] = socket;
         socket.gameCode = gameCode
         
         // Tell game client to initialize 
         //  and show the game code to the user
         socket.emit("initialize", gameCode);
      }

      // if client is a phone controller
      else if(device.type == "controller")
      {
         // if game code is valid...
         if(device.gameCode in socketCodes)
         {
            // save the game code for controller commands
            socket.gameCode = device.gameCode

            // initialize the controller
            socket.emit("connected", {});

            // start the game
            socketCodes[device.gameCode].emit("connected", {});
         }
         // else game code is invalid, 
         //  send fail message and disconnect
         else
         {
            socket.emit("fail", {});
            socket.disconnect();
         }
      }
   });
   
   socket.on("jump", function(data)
   {
      if(socket.gameCode && socket.gameCode in socketCodes)
      {
         socketCodes[socket.gameCode].emit("jump");
      }
   });
   socket.on("up", function(data)
   {
      if(socket.gameCode && socket.gameCode in socketCodes)
      {
         socketCodes[socket.gameCode].emit("up");
      }
   });
   socket.on("down", function(data)
   {
      if(socket.gameCode && socket.gameCode in socketCodes)
      {
         socketCodes[socket.gameCode].emit("down");
      }
   });
   socket.on("left", function(data)
   {
      if(socket.gameCode && socket.gameCode in socketCodes)
      {
         socketCodes[socket.gameCode].emit("left");
      }
   });
   socket.on("right", function(data)
   {
      if(socket.gameCode && socket.gameCode in socketCodes)
      {
         socketCodes[socket.gameCode].emit("right");
      }
   });
   socket.on("start", function(data)
   {
      if(socket.gameCode && socket.gameCode in socketCodes)
      {
         socketCodes[socket.gameCode].emit("start");
      }
   });
   socket.on("a", function(data)
   {
      if(socket.gameCode && socket.gameCode in socketCodes)
      {
         socketCodes[socket.gameCode].emit("a");
      }
   });
   socket.on("b", function(data)
   {
      if(socket.gameCode && socket.gameCode in socketCodes)
      {
         socketCodes[socket.gameCode].emit("b");
      }
   });

   socket.on('disconnect', function () 
   {
      // remove game code -> socket association on disconnect
      if(socket.gameCode && socket.gameCode in socketCodes)
      {
         socketCodes[socket.gameCode].emit("disconnected");
         delete socketCodes[socket.gameCode];
      }
    });
});