/*
   config.mongoLab = {
      address : 'ds033163.mongolab.com:33163/blox',
      name : 'nicolasmartinos',
      pass : '*******'
   };
   var mongoose = require('./node_modules/mongoose');

   mongoose.connect('mongodb://' + config.mongoLab.name + ':' + config.mongoLab.pass + '@' + config.mongoLab.address, {
      server : {
         socketOptions : {
            keepAlive: 1
         }
      },
      replset : {
         socketOptions : {
            keepAlive: 1
         }
      }
   });
   var db = mongoose.connection;
   db.on('error', console.error.bind(console, 'connection error:'));
   var shopSchema = mongoose.Schema({
      name: {
         type: String,
         required: true,
         unique: true
      },
      token: {
         type: String,
         required: true
      },
      temp: {
         type: String,
         required: true
      }
   });
   shopSchema.methods.report = function() 
   {
      console.log('Shop Model Report : _id = ' + this._id);
      console.log('Shop Model Report : name = ' + this.name);
   };
   var blop = mongoose.model('Shop', shopSchema);

   var newShop = new Shop(data);

   var save = (function (error, shop)
   {
      if (error)
      {
         console.log('failed to save to db (see below)');
         console.log(error);
         cb(false);
      }
      else
      {
         console.log('saved : ');
         console.log(shop);
         cb(true, shop);
      }
   });


   var find = function (name, condition, cb)
   {
      try
      {
         Shop.find(condition, function(error, shops)
         {
            if (error)
            {
               console.log('error looking for shop in DB (see below)');
               console.log(error);
               cb();
            }
            else if (shops.length)
            {
               console.log(shops.length + ' shop(s) found in db with the name ' + name);
               cb(shops);
            }
            else
            {
               console.log('0 shop(s) found in db with the name ' + name);
               cb();
            }
         });
      }
      catch (error)
      {
         console.log('ERROR CAUGHT looking for shop in DB (see below)');
         console.log(error);
      }
   };

   var remove = function (name, condition, cb)
   {
      try
      {
         self.db.find(name, condition, function (shops)
         {
            if (shops)
             {
                 shops.remove(function (err, removed)
                 {
                  if (err)
                  {
                     console.log('error removing ' + name + ' from db (see below)');
                     console.log(err);
                     cb(false);
                  }
                  else
                  {
                       console.log('all ' + name + ' removed from db (see below)');
                       console.log(removed);
                       cb(true);
                   }
                 });
             }
             else
             {
               console.log(name + ' not found in db');
               cb(false);
             }
         });
      }
      catch (err)
      {
         console.log('ERROR CAUGHT trying to remove ' + name + ' from db (see below)');
         console.log(err);
         cb(false);
      }
   };
*/
// santass.herokuapp.com
// heroku ps:scale web=1 --app santass

var crypto = require('crypto');
var app = require('express')();
app.use(function (req, res, next) 
{
   // Website you wish to allow to connect
   res.setHeader('Access-Control-Allow-Origin', 'http://christmas.vitaminlondon.com');
});

var server = require('http').createServer(app);
var io = require('socket.io')(server);
io.set('origins', '*:*');

server.listen(process.env.PORT || 3000);






// Sockets object to save game code -> socked associations
var socketCodes = {};

// When a client connects...
//io.sockets.on('connection', function(socket) 
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
         socketCodes[gameCode] = io.sockets.sockets[socket.id];
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
   
   // send jump command to game client
   socket.on("jump", function(data)
   {
      var bAccelerate = data.jump;
      if(socket.gameCode && socket.gameCode in socketCodes)
      {
         socketCodes[socket.gameCode].emit("jump", bAccelerate);
      }
   });
   
   // send shoot command to game client
   socket.on("shoot", function(data)
   {
      if(socket.gameCode && socket.gameCode in socketCodes)
      {
         socketCodes[socket.gameCode].emit("shoot", data.shoot);
      }
   });
});

// When a client disconnects...
//io.sockets.on('disconnect', function(socket)
io.on('disconnect', function(socket) 
{
   // remove game code -> socket association on disconnect
   if(socket.gameCode && socket.gameCode in socketCodes)
   {
      delete socketCodes[socket.gameCode];
   }
});