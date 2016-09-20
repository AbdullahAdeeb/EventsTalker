///////////////////////////////
//[[[    ACCOUNT SERVICE  ]]]]]
//////////////////////////////

angular.module('onTimeApp').factory('Account', function(FireRef, UsersRef, $firebaseObject, Auth, $cordovaGeolocation) {
  'use strict';

  var services = {}; // accessed globaly as Account

  // this function is only called after auth is true
  function init(authData) {
    console.info('loading services =', authData);
    services.fbo = $firebaseObject(UsersRef.child(authData.uid));
    var myConnectionsRef = services.$ref().child('connections');
    // stores the timestamp of my last disconnect (the last time I was seen online)
    var lastOnlineRef = services.$ref().child('lastOnline');
    var connectedRef = FireRef.child('.info/connected');


    connectedRef.on('value', function(snap) {
      if (snap.val() === true) {
        // We're connected (or reconnected)! Do anything here that should happen only if online (or on reconnect)
        // add this device to my connections list
        // this value could contain info about the device or a timestamp too
        var con = myConnectionsRef.push(true);
        // when I disconnect, remove this device
        con.onDisconnect().remove();
        // when I disconnect, update the last time I was seen online
        lastOnlineRef.onDisconnect().set(firebase.database.ServerValue.TIMESTAMP);
      }
    });

    //FCMPlugin.onNotification( onNotificationCallback(data), successCallback(msg), errorCallback(err) )
    //Here you define your application behaviour based on the notification data.
    if (typeof FCMPlugin !== 'undefined') {
      FCMPlugin.onNotification(
        function(data) {
          if (data.wasTapped) {
            //Notification was received on device tray and tapped by the user.
            window.alert(JSON.stringify(data));
          } else {
            //Notification was received in foreground. Maybe the user needs to be notified.
            window.alert(JSON.stringify(data));
          }
        },
        function(msg) {
          console.log('onNotification callback successfully registered: ' + msg);
        },
        function(err) {
          console.log('Error registering onNotification callback: ' + err);
        }
      );

      FCMPlugin.getToken(
        function(token) {
          window.alert(token);
        },
        function(err) {
          console.log('error retrieving token: ' + err);
        }
      )
    }

    startLocationWatching();
  }

  //////// GEO HANDLING  /////////
  var locationChangeListeners = [];

  services.addLocationChangeListener = function(callback) {
    if (typeof callback != 'function') {
      console.error('Error: non function parameter given to addLocationChangeListener');
      return;
    }
    locationChangeListeners.push(callback);
  };

  var broadcastLocation = function() {
    for (var l = 0; l < locationChangeListeners.length; l++) {
      var f = locationChangeListeners[l];
      f();
    }
  };

  // start the GeoLocation watcher and update the Account.location
  var startLocationWatching = function() {
    $cordovaGeolocation.watchPosition({
      //Watch Options
      timeout: 3000,
      enableHighAccuracy: false // may cause errors if true
    }).then(
      null,
      function(err) {
        // error
        window.alert(err);
      },
      function(position) {
        //position changed
        var location = {
          'timestamp':position.timestamp,
          'lat':position.coords.latitude,
          'lng':position.coords.longitude,
          'accuracy':position.coords.accuracy,
          'speed':position.coords.speed
      };

        services.$ref().child('location').set(location);
        console.debug('location watcher >> ', position, ' || Account.location=', services.getLocation());

        broadcastLocation(services.location);
      });
  };

  //////// END - GEO LOCATION HANDLING //////////////

////// ACCOUNT GETTERS ///////
  services.$ref = function() {
    return services.fbo.$ref();
  };

  services.getUsername = function() {
    return services.fbo.username;
  };

  services.getId = function() {
    return Auth.$getAuth().uid;
  };

  services.getLocation = function() {
    return services.fbo.location;
};
  ////////////////////////

  var authData = Auth.$getAuth();
  if (authData) {
    //authenticated
    init(authData);
  } else {
    //not authenticated
    console.log("Logged out");
    Auth.$onAuthStateChanged(function(authData) {
      init(authData);
    });
  }
  return services;
});
