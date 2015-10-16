         var turnLeftKey = 37;
         var turnRightKey = 39;
         var forwardKey = 38;
         var backwardKey = 40;
         var breakLeftKey = 65;
         var breakRightKey = 68;
         
         var keys = [37,39, 40, 65, 68];
         var resetEvents = function()
         {
            for(key in keys)
            {
               $(document).trigger(
                  $.Event('keyup', {
                     which: keys[key],
                     keyCode: keys[key]
                  })
               );
            }
         };
         
         var resetEvent = function(key)
         {
            $(document).trigger(
               $.Event('keyup', {
                  which: key,
                  keyCode: key
               })
            );
         };
         
         var turnLeftEvent = $.Event('keydown', {
                  which: turnLeftKey,
                  keyCode: turnLeftKey
         });
         
         var turnRightEvent = $.Event('keydown', {
                  which: turnRightKey,
                  keyCode: turnRightKey
         });         
         
         var breakLeftEvent = $.Event('keydown', {
                  which: breakLeftKey,
                  keyCode: breakLeftKey
         });  
         
         var breakRightEvent = $.Event('keydown', {
                  which: breakRightKey,
                  keyCode: breakRightKey
         });           
         
         
         var turnLeft = function()
         {
            resetEvent(turnRightKey);
            $(document).trigger(turnLeftEvent);
         };
         
         var turnRight = function()
         {
            resetEvent(turnLeftKey);
            $(document).trigger(turnRightEvent);
         };
         
         var breakLeft = function()
         {
            resetEvent(breakRightKey);
            resetEvent(turnLeftKey);
            resetEvent(turnRightKey);
            
            $(document).trigger(breakLeftEvent);
         };
         
         var breakRight = function()
         {
            resetEvent(breakLeftKey);
            resetEvent(turnLeftKey);
            resetEvent(turnRightKey);
            
            $(document).trigger(breakRightEvent);
         };
         
         
         var forward = function()
         {
            $(document).trigger($.Event('keydown', {
                  which: forwardKey,
                  keyCode: forwardKey
            }));
         };

