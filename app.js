// santass.herokuapp.com
// heroku ps:scale web=1 --app santass







// CONDITIONAL LOGGING
var logging = true;
var conditional_log = function (msg)
{
   if (logging) console.log(msg);
};







// NODE MODULES
var crypto = require('crypto');
var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

// START LISTENING
server.listen(process.env.PORT || 3000);

// STORE SOCKET CONNECTIONS
var socketCodes = {};








io.on('connection', function(socket) 
{
   conditional_log('client connected');
   conditional_log(' ****** socket ****** ');
   conditional_log(socket);
   conditional_log(' ****** socket ****** ');

   // CONFIRM CONNECTION WITH CLIENT
   socket.emit("welcome", {});
   conditional_log('client welcomed');
   
   
   // Receive the client device type
   socket.on("device", function(device)
   {
      conditional_log('client sent device type');
      conditional_log(' ****** device ****** ');
      conditional_log(device);
      conditional_log(' ****** device ****** ');

      if(device.type == "game")
      {
         conditional_log('client is game');

         // GENERATE UNIQUE GAME CODE
         var gameCode = crypto.randomBytes(3).toString('hex');
         while (gameCode in socketCodes)
         {
            gameCode = crypto.randomBytes(3).toString('hex');
         }
         
         conditional_log('unique code generated for this game = ' + gameCode);

         // Store game code -> socket association
         socketCodes[gameCode] = socket;
         socket.gameCode = gameCode
         
         // Tell game client to initialize 
         //  and show the game code to the user
         socket.emit("initialize", gameCode);
      }

      // if client is a phone controller
      else if (device.type == "controller")
      {
         conditional_log('client is controller with gamecode ==>' + device.gameCode);

         // if game code is valid...
         if (device.gameCode in socketCodes)
         {
            conditional_log('controller gameCode ' + device.gameCode + ' found');

            if (!socketCodes[device.gameCode].activated)
            {
               // do not allow multiple controllers on the same game session
               socketCodes[device.gameCode].activated = true;

               // save the game code for controller commands
               socket.gameCode = device.gameCode

               // initialize the controller
               socket.emit("connected", {});

               // start the game
               socketCodes[device.gameCode].emit("connected", {});

               conditional_log('controller connected to device');
            }
            else
            {
               conditional_log('a controller has already been connected to this game session');
            }
         }
         //  else game code is invalid, 
         //  send fail message and disconnect
         else
         {
            conditional_log('game code received by controller is not found');
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
      if(socket.gameCode && (socket.gameCode in socketCodes))
      {
         conditional_log('active socket disconnected = ' + socket.gameCode);
         socketCodes[socket.gameCode].emit("disconnected");
         delete socketCodes[socket.gameCode];
      }
    });
});