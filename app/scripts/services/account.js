


///////////////////////////////
//[[[    ACCOUNT SERVICE  ]]]]]
//////////////////////////////

angular.module('onTimeApp').factory('Account', function(FireRef, UsersRef, $firebaseObject, Auth, $cordovaGeolocation) {
  'use strict';

  var account = {
    'location': {
      'lat': 0,
      'lng': 0,
      'accuracy': 0,
      'speed': 0
    }
  };

  account.$ref = function() {
    return account.fbo.$ref();
  };
  account.getUsername = function() {
    return account.fbo.username;
  };
  account.getId = function() {
    return account.fbo.$id;
  };

  // start the GeoLocation watcher and update the Account.location
  account.startLocationWatching = function() {
    var watchOptions = {
      timeout: 3000,
      enableHighAccuracy: false // may cause errors if true
    };
    $cordovaGeolocation.watchPosition(watchOptions).then(
      null,
      function(err) {
        // error
        alert(err);
      },
      function(position) {
        account.location.timestamp = position.timestamp;
        account.location.lat = position.coords.latitude;
        account.location.lng = position.coords.longitude;
        account.location.accuracy = position.coords.accuracy;
        account.location.speed = position.coords.speed;

        account.$ref().child('location').set(account.location);
        console.debug('location watcher >> ', position, ' || account.location=', account.location);

      });
  }

  function loadAccount(authData) {
    console.debug(Auth.$getAuth());
    console.log("Logged in as:", authData.uid);
    account.fbo = $firebaseObject(UsersRef.child(authData.uid));
    console.debug(account);
    var myConnectionsRef = account.$ref().child('connections');
    // stores the timestamp of my last disconnect (the last time I was seen online)
    var lastOnlineRef = account.$ref().child('lastOnline');
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
        lastOnlineRef.onDisconnect().set(Firebase.ServerValue.TIMESTAMP);
      }
    });
    account.startLocationWatching();
  }

  var authData = Auth.$getAuth();
  if (authData) {
    //authenticated
    loadAccount(authData);
  } else {
    //not authenticated
    console.log("Logged out");
    Auth.$onAuth(function(authData) {
      loadAccount(authData);
    });
  }




  return account;
});
