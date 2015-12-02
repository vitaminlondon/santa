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
conditional_log('<><><><><><><><> LISTENING <><><><><><><><>');

// STORE SOCKET CONNECTIONS
var socketCodes = {};








io.on('connection', function(socket) 
{
   conditional_log('client connected');


   // CONFIRM CONNECTION WITH CLIENT
   socket.emit("welcome", {});
   conditional_log('client welcomed');
   
   
   // Receive the client device type
   socket.on("device", function(device)
   {
      // if(device.type == "game")
      // {
      //    conditional_log('client is game');

      //    // GENERATE UNIQUE GAME CODE
      //    var gameCode = crypto.randomBytes(3).toString('hex');
      //    while (gameCode in socketCodes)
      //    {
      //       gameCode = crypto.randomBytes(3).toString('hex');
      //    }
         
      //    conditional_log('UID for this game will be ' + gameCode);

      //    // Store game code -> socket association
      //    socketCodes[gameCode] = {
      //       game : socket
      //    };
      //    socket.gameCode = gameCode
         
      //    // Tell game client to initialize 
      //    //  and show the game code to the user
      //    socket.emit("initialize", gameCode);

      //    conditional_log('sent UID to game');
      // }

      // if client is a phone controller
      if (device.type == "controller")
      {
         conditional_log('client is controller using UID =' + device.gameCode);

         // GAME CODE NOT FOUND
         if (!socketCodes[device.gameCode])
         {
            conditional_log('game code received by controller is not found');
            socket.emit("fail", device.gameCode);
            socket.disconnect();
         }
         // ANOTHER CONTROLLER ALREADY COnneCt to the gAMe session tHAT thIS CONTROLLER WOULD LIKE TO CONNECT TO
         else if (socketCodes[device.gameCode].activated)
         {
            socket.emit("late");
            conditional_log('a controller has already been connected to this game session');
         }
         // CONTROLLER CAN CONNECT TO GAME-SESSION
         else
         {
            conditional_log('controller used by UID found');

            // do not allow multiple controllers on the same game session
            socketCodes[device.gameCode].controller = socket;
            socketCodes[device.gameCode].activated = true;

            // save the game code for controller commands
            socket.gameCode = device.gameCode

            // initialize the controller
            socket.emit("connected", socket.gameCode);

            // start the game
            socketCodes[device.gameCode].game.emit("connected", socket.gameCode);

            conditional_log('controller connected to device');
         }
      }
   });

   socket.on("new", function ()
   {
      if(socket.gameCode && (socket.gameCode in socketCodes))
      {
         delete socketCodes[socket.gameCode];
      }
      
      var gameCode = crypto.randomBytes(3).toString('hex');
      while (gameCode in socketCodes)
      {
         gameCode = crypto.randomBytes(3).toString('hex');
      }
      
      conditional_log('UID for this game will be ' + gameCode);

      // Store game code -> socket association
      socketCodes[gameCode] = {
         game: socket,
         activated: false
      };
      socket.gameCode = gameCode
      
      // Tell game client to initialize 
      //  and show the game code to the user
      socket.emit("initialize", gameCode);
   });
   
   socket.on("jumpstart", function(data)
   {
      if(socket.gameCode && socket.gameCode in socketCodes)
      {
         socketCodes[socket.gameCode].game.emit("jumpstart");
      }
   });
   socket.on("jumpend", function(data)
   {
      if(socket.gameCode && socket.gameCode in socketCodes)
      {
         socketCodes[socket.gameCode].game.emit("jumpend");
      }
   });
   
   socket.on("start", function(data)
   {
      if(socket.gameCode && socket.gameCode in socketCodes)
      {
         socketCodes[socket.gameCode].game.emit("start");
      }
   });

   socket.on("resume", function(data)
   {
      console.log('got resume')
      if(socket.gameCode && socket.gameCode in socketCodes)
      {
         socketCodes[socket.gameCode].controller.emit("resume");
         console.log('sent resume');
      }
   });

   socket.on("a-start", function(data)
   {
      if(socket.gameCode && socket.gameCode in socketCodes)
      {
         socketCodes[socket.gameCode].game.emit("a-start");
         console.log('a-start');
      }
   });

   socket.on("b-start", function(data)
   {
      if(socket.gameCode && socket.gameCode in socketCodes)
      {
         socketCodes[socket.gameCode].game.emit("b-start");
         console.log('b-start');
      }
   });

   socket.on("b-end", function(data)
   {
      if(socket.gameCode && socket.gameCode in socketCodes)
      {
         socketCodes[socket.gameCode].game.emit("b-end");
         console.log('b-end');
      }
   });

   socket.on('disconnect', function () 
   {     
      // remove game code -> socket association on disconnect
      if(socket.gameCode && (socket.gameCode in socketCodes))
      {
         conditional_log('active socket disconnected for UID = ' + socket.gameCode);
         socketCodes[socket.gameCode].game.emit("disconnected", socket.gameCode);
         delete socketCodes[socket.gameCode];
      }
   });
});